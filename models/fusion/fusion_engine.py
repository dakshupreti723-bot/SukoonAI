"""
models/fusion/fusion_engine.py

Combines the three pipeline stages into one final risk assessment:

    Score 1  -> PHQ-9 (rule-based, clinically validated instrument)
    Score 2  -> Journal / AI-chat sentiment model (models.sentiment.inference)
    Score 3  -> Voice recording
                  (a) Acoustic emotion model (models.voice.predict)
                  (b) Speech-to-text -> same sentiment model as Score 2

Output: a fused risk score + Low / Medium / High category + a
recommendation/helpline payload for the front end.

IMPORTANT: This is a decision-support aid, not a diagnostic tool. Any
Medium/High output should route to a human-reviewed helpline path.

NOTE: Business logic (scoring formula, fusion weights, voice subweights,
recommendation text, thresholds, risk mapping, helpline logic, and safety
overrides) is preserved exactly as originally designed and validated.
Only imports, structure, typing, logging, and integration points were
updated in this refactor.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from dataclasses import dataclass, field
from typing import Optional

# Whisper is loaded lazily (see get_whisper_model) so that importing this
# module — e.g. at FastAPI startup or when only PHQ-9/text scoring is needed —
# does NOT download or load the ~140MB acoustic model. The model size is
# configurable via the WHISPER_MODEL_SIZE env var (default "base").
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
_WHISPER_MODEL = None


def get_whisper_model():
    """Lazily load and cache the Whisper speech-to-text model once."""
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        import whisper  # local import so this module loads without the dep
        logger.info("Loading Whisper model (%s) ...", WHISPER_MODEL_SIZE)
        _WHISPER_MODEL = whisper.load_model(WHISPER_MODEL_SIZE)
        logger.info("Whisper model loaded.")
    return _WHISPER_MODEL


# ------------------------------------------------------------------
# Reuse the existing, already-trained sentiment model via a proper
# package import (models/sentiment/inference.py) instead of the old
# import_module("04_inference") dynamic-import approach.
#
# predict_sentiment(text) -> {"prediction", "confidence", "probabilities"}
# ------------------------------------------------------------------
from models.sentiment.inference import predict_sentiment

# ------------------------------------------------------------------
# Reuse the existing, production-ready voice emotion module
# (models/voice/predict.py). This module already owns model loading,
# label decoding, and MFCC feature extraction, so fusion_engine.py
# must not duplicate that work or reload TensorFlow itself.
#
# predict_emotion(audio_path) -> {
#     "predicted_emotion": str,
#     "confidence": float,
#     "top_k": ...,
#     "all_probabilities": ...,
# }
# ------------------------------------------------------------------
from models.voice.predict import predict_emotion

logger = logging.getLogger(__name__)
if not logger.handlers:
    # Library-friendly default: only attaches a handler if the host
    # application (e.g. FastAPI) hasn't already configured logging.
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


# ====================================================================
# CONFIG — unchanged. Adjust only to match actual trained label sets.
# ====================================================================

# Weights across the three sub-scores. Must sum to 1.0.
FUSION_WEIGHTS = {
    "phq9": 0.5,      # validated instrument -> highest trust
    "journal": 0.25,
    "voice": 0.25,
}

# Within "voice", how much to trust the acoustic model vs the
# transcript-based text model.
VOICE_SUBWEIGHTS = {
    "acoustic": 0.6,
    "transcript_text": 0.4,
}

# Map the journal/chat model's classes to a 0-1 risk contribution.
JOURNAL_CLASS_RISK = {
    "Normal": 0.05,
    "Anxiety": 0.55,
    "Stress": 0.5,
    "Depression": 0.75,
    "Bipolar": 0.6,
    "Personality disorder": 0.6,
    "Suicidal": 1.0,
}
SUICIDAL_CLASS_NAME = "Suicidal"          # exact string used as override trigger
SUICIDAL_CONFIDENCE_OVERRIDE = 0.60       # confidence above which we hard-escalate

# Map acoustic emotion classes to a 0-1 risk contribution.
VOICE_EMOTION_RISK = {
    "neutral": 0.2,
    "calm": 0.05,
    "happy": 0.0,
    "sad": 0.75,
    "angry": 0.55,
    "fearful": 0.7,
    "disgust": 0.5,
    "surprised": 0.3,
}

# Final banding thresholds on the fused 0-1 score.
RISK_BANDS = [
    (0.0, 0.33, "Low"),
    (0.33, 0.66, "Medium"),
    (0.66, 1.01, "High"),
]

# EDIT: put actual regional crisis line(s) here before deployment.
HELPLINE_INFO = {
    "India": {"name": "Tele-MANAS", "number": "14416"},
    # add more region entries as needed
}


# ====================================================================
# Score 1 — PHQ-9
# ====================================================================

@dataclass
class PHQ9Result:
    total: int
    normalized: float          # total / 27, 0-1
    severity: str
    item9_flag: bool           # True if any nonzero answer on the self-harm item


def score_phq9(responses: list[int]) -> PHQ9Result:
    """Score a PHQ-9 questionnaire.

    Args:
        responses: list of 9 ints, each 0-3, in question order
            (item index 8 = Q9, the self-harm ideation item).
    """
    if len(responses) != 9 or not all(0 <= r <= 3 for r in responses):
        raise ValueError("PHQ-9 requires exactly 9 responses, each between 0 and 3.")

    total = sum(responses)
    if total <= 4:
        severity = "Minimal"
    elif total <= 9:
        severity = "Mild"
    elif total <= 14:
        severity = "Moderate"
    elif total <= 19:
        severity = "Moderately Severe"
    else:
        severity = "Severe"

    return PHQ9Result(
        total=total,
        normalized=total / 27,
        severity=severity,
        item9_flag=responses[8] > 0,
    )


# ====================================================================
# Score 2 — Journal / chat sentiment model (text only)
# ====================================================================

@dataclass
class TextRiskResult:
    prediction: str
    confidence: float
    risk: float                # 0-1, mapped via JOURNAL_CLASS_RISK
    suicidal_override: bool
    probabilities: dict = field(default_factory=dict)  # full class->prob map


def score_text(text: str) -> TextRiskResult:
    """Run the sentiment model on a block of text and map it to a risk score."""
    result = predict_sentiment(text)
    prediction = result["prediction"]
    confidence = result["confidence"]

    # predict_sentiment() prefixes low-confidence predictions with
    # "Uncertain (Low Confidence: X)" — strip that back to the raw class
    # so it can still be mapped to a risk value, just discounted a bit.
    raw_label = prediction
    discounted = False
    if isinstance(prediction, str) and prediction.startswith("Uncertain"):
        raw_label = prediction.split(":", 1)[-1].strip(") ")
        discounted = True

    base_risk = JOURNAL_CLASS_RISK.get(raw_label, 0.3)  # 0.3 = unknown-class fallback
    risk = base_risk * (0.7 if discounted else 1.0)

    suicidal_override = (
        raw_label == SUICIDAL_CLASS_NAME and confidence >= SUICIDAL_CONFIDENCE_OVERRIDE
    )

    logger.info("Sentiment Prediction Complete: label=%s confidence=%.3f risk=%.3f",
                raw_label, confidence, risk)

    return TextRiskResult(
        prediction=raw_label,
        confidence=confidence,
        risk=risk,
        suicidal_override=suicidal_override,
        probabilities=result.get("probabilities", {}),
    )


# ====================================================================
# Score 3 — Voice (acoustic emotion + speech-to-text -> text model)
# ====================================================================

def transcribe_audio(audio_path: str) -> str:
    """
    Speech-to-text step. Uses local Whisper so audio never has to leave
    the platform's infra.

    Whisper's default ``transcribe(path)`` shells out to ffmpeg to decode
    audio. To keep the deployment ffmpeg-free, we decode the file ourselves
    with librosa (soundfile backend for WAV) into a 16 kHz mono float32
    array and hand that array to Whisper instead of a path.
    """
    import librosa

    logger.info("Transcription Started: %s", audio_path)
    # Whisper expects 16 kHz mono float32 in [-1, 1].
    audio, _ = librosa.load(audio_path, sr=16000, mono=True)
    result = get_whisper_model().transcribe(audio.astype("float32"))
    transcript = result["text"].strip()
    logger.info("Transcription Complete: %d characters", len(transcript))
    return transcript


@dataclass
class VoiceRiskResult:
    emotion_label: str
    emotion_confidence: float
    transcript: str
    transcript_text_result: TextRiskResult
    risk: float                # combined acoustic + transcript risk
    top_k: list = field(default_factory=list)          # ranked emotion predictions
    all_probabilities: dict = field(default_factory=dict)  # full emotion->prob map


def score_voice(audio_path: str) -> VoiceRiskResult:
    """Combine acoustic emotion risk with transcript-based text risk."""

    try:
        transcript = transcribe_audio(audio_path)
    except Exception as exc:
        logger.warning("Transcription failed: %s", exc)
        transcript = ""

    text_result = (
        score_text(transcript)
        if transcript
        else TextRiskResult(
            prediction="Normal",
            confidence=0.0,
            risk=0.0,
            suicidal_override=False,
        )
    )

    logger.info("Voice Prediction Started: %s", audio_path)
    # Delegate entirely to the production voice module: it owns model
    # loading, label decoding, and MFCC feature extraction. Fusion only
    # consumes the resulting emotion label and confidence.
    emotion_result = predict_emotion(audio_path)
    emotion_label = emotion_result["predicted_emotion"]
    emotion_confidence = emotion_result["confidence"]
    logger.info("Voice Prediction Complete: emotion=%s confidence=%.3f",
                emotion_label, emotion_confidence)

    acoustic_risk = VOICE_EMOTION_RISK.get(emotion_label, 0.3)

    combined = (
        VOICE_SUBWEIGHTS["acoustic"] * acoustic_risk
        + VOICE_SUBWEIGHTS["transcript_text"] * text_result.risk
    )

    return VoiceRiskResult(
        emotion_label=emotion_label,
        emotion_confidence=emotion_confidence,
        transcript=transcript,
        transcript_text_result=text_result,
        risk=combined,
        top_k=emotion_result.get("top_k", []),
        all_probabilities=emotion_result.get("all_probabilities", {}),
    )


# ====================================================================
# Fusion
# ====================================================================

@dataclass
class FinalRiskResult:
    fused_score: float
    category: str               # Low / Medium / High
    overridden: bool            # True if a safety override forced escalation
    override_reason: Optional[str]
    breakdown: dict = field(default_factory=dict)
    recommendation: str = ""
    helpline: Optional[dict] = None


def band_for_score(score: float) -> str:
    for low, high, label in RISK_BANDS:
        if low <= score < high:
            return label
    return "High"


def fuse_scores(
    phq9: PHQ9Result,
    journal: TextRiskResult,
    voice: VoiceRiskResult,
    region: str = "India",
) -> FinalRiskResult:
    fused = (
        FUSION_WEIGHTS["phq9"] * phq9.normalized
        + FUSION_WEIGHTS["journal"] * journal.risk
        + FUSION_WEIGHTS["voice"] * voice.risk
    )

    overridden = False
    reason = None

    if phq9.item9_flag:
        overridden = True
        reason = "PHQ-9 item 9 (self-harm ideation) endorsed"
    elif journal.suicidal_override:
        overridden = True
        reason = f"Journal/chat model flagged '{SUICIDAL_CLASS_NAME}' with high confidence"
    elif voice.transcript_text_result.suicidal_override:
        overridden = True
        reason = "Voice transcript flagged suicidal-risk language with high confidence"

    category = band_for_score(fused)
    if overridden and category == "Low":
        category = "Medium"   # never let a safety flag get masked by a low total

    recommendations = {
        "Low": "Symptoms appear minimal. Continue routine check-ins and self-care resources.",
        "Medium": "Some indicators of distress detected. Recommend reviewing with a counselor "
                   "and offering self-help resources plus an easy path to professional support.",
        "High": "Significant risk indicators detected. Immediately surface helpline information "
                "and, where possible, prompt human/clinical follow-up rather than relying on the app alone.",
    }

    if overridden:
        logger.warning("Safety Override Triggered: %s", reason)

    return FinalRiskResult(
        fused_score=round(fused, 4),
        category=category,
        overridden=overridden,
        override_reason=reason,
        breakdown={
            "phq9": {"total": phq9.total, "severity": phq9.severity, "normalized": phq9.normalized},
            "journal": {"prediction": journal.prediction, "confidence": journal.confidence, "risk": journal.risk},
            "voice": {
                "emotion": voice.emotion_label,
                "emotion_confidence": voice.emotion_confidence,
                "transcript_prediction": voice.transcript_text_result.prediction,
                "risk": voice.risk,
            },
        },
        recommendation=recommendations[category],
        helpline=HELPLINE_INFO.get(region) if category in ("Medium", "High") else None,
    )


# ====================================================================
# End-to-end entry point — safe to call from FastAPI as-is.
# ====================================================================

def warmup() -> None:
    """Eagerly load every model the fusion pipeline depends on (voice, text,
    Whisper) so the first real request doesn't pay the cold-start cost."""
    from models.voice.predict import warmup as warmup_voice
    warmup_voice()
    predict_sentiment("warmup")   # loads the transformer singleton
    get_whisper_model()


def run_pipeline(phq9_responses: list[int], journal_text: str, audio_path: str) -> dict:
    """Run the full PHQ-9 + journal + voice fusion pipeline.

    Returns the complete *model-side* structured contract (per-module
    predictions + fused result). The Gemini support block and the optional
    face block are added by the API layer, not here — this module has no
    dependency on the backend or on Gemini.
    """
    logger.info("Fusion Pipeline Started")

    phq9_result = score_phq9(phq9_responses)
    journal_result = score_text(journal_text)
    voice_result = score_voice(audio_path)
    final = fuse_scores(phq9_result, journal_result, voice_result)

    logger.info("Fusion Complete: score=%.4f category=%s overridden=%s",
                final.fused_score, final.category, final.overridden)

    return {
        "text_prediction": {
            "prediction": journal_result.prediction,
            "confidence": journal_result.confidence,
            "probabilities": journal_result.probabilities,
        },
        "voice_prediction": {
            "emotion": voice_result.emotion_label,
            "confidence": voice_result.emotion_confidence,
            "top_k": voice_result.top_k,
            "probabilities": voice_result.all_probabilities,
            "transcript_prediction": voice_result.transcript_text_result.prediction,
        },
        "phq9": {
            "total": phq9_result.total,
            "severity": phq9_result.severity,
            "normalized": phq9_result.normalized,
            "item9_flag": phq9_result.item9_flag,
        },
        "fusion": {
            "fused_score": final.fused_score,
            "risk_level": final.category,      # Low / Medium / High
            "overridden": final.overridden,
            "override_reason": final.override_reason,
            "breakdown": final.breakdown,
            "recommendation": final.recommendation,
            "helpline": final.helpline,
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--phq9", required=True, help="Comma-separated 9 ints, e.g. 1,2,0,1,0,0,1,0,0")
    parser.add_argument("--journal_text", required=True)
    parser.add_argument("--audio", required=True)
    args = parser.parse_args()

    phq9_list = [int(x) for x in args.phq9.split(",")]
    output = run_pipeline(phq9_list, args.journal_text, args.audio)
    print(json.dumps(output, indent=2))