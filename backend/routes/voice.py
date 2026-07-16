# -*- coding: utf-8 -*-
"""
backend/routes/voice.py

Voice emotion evaluation route. Accepts an uploaded audio recording,
runs it through the production voice-emotion model, maps the predicted
emotion to a depression risk score, and returns the result.
"""

import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from models.voice.predict import predict_emotion

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

router = APIRouter()

ALLOWED_EXTENSIONS = (".wav", ".mp3", ".ogg", ".m4a", ".webm")
# Resolve relative to this file (backend/routes/ -> backend/uploads/voice)
# so uploads land in the right place regardless of the process CWD.
UPLOAD_DIR = str(Path(__file__).resolve().parents[1] / "uploads" / "voice")

# Maps a predicted emotion label to a 0-100 depression risk score.
RISK_MAP = {
    "happy": 10,
    "calm": 15,
    "neutral": 30,
    "surprised": 25,
    "disgust": 55,
    "angry": 60,
    "fearful": 75,
    "sad": 90,
}

# Short human-readable analysis line per emotion, used in the response.
ANALYSIS_MAP = {
    "happy": "Voice characteristics suggest a positive, upbeat emotional state.",
    "calm": "Voice characteristics suggest a calm, emotionally settled state.",
    "neutral": "Voice characteristics suggest a neutral, emotionally flat state.",
    "surprised": "Voice characteristics suggest heightened alertness or surprise.",
    "disgust": "Voice characteristics suggest discomfort or aversion.",
    "angry": "Voice characteristics suggest frustration or irritability.",
    "fearful": "Voice characteristics suggest anxiety or apprehension.",
    "sad": "Voice characteristics suggest emotional sadness.",
}


@router.post("/voice")
async def evaluate_voice_biometrics(voice_audio: UploadFile = File(...)):
    # Standard security file extension validation
    if not voice_audio.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="Invalid audio file layout. Please submit a WAV, MP3, OGG, or M4A file.",
        )

    logger.info("Voice upload received: %s", voice_audio.filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_extension = os.path.splitext(voice_audio.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    saved_audio_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(saved_audio_path, "wb") as buffer:
            buffer.write(await voice_audio.read())

        logger.info("Prediction started: %s", saved_audio_path)
        try:
            result = predict_emotion(saved_audio_path)
        except Exception as exc:
            logger.exception("Voice emotion prediction failed")
            raise HTTPException(
                status_code=500,
                detail=f"Voice emotion prediction failed: {exc}",
            ) from exc
        logger.info("Prediction completed: %s", saved_audio_path)

        predicted_emotion = result["predicted_emotion"]
        confidence = round(result["confidence"] * 100, 2)
        top_predictions = result.get("top_k", [])

        risk_score = RISK_MAP.get(predicted_emotion, 30)
        analysis = ANALYSIS_MAP.get(
            predicted_emotion,
            "Voice characteristics were analyzed for emotional indicators.",
        )

        return {
    "emotion": predicted_emotion,
    "confidence": confidence,
    "riskScore": risk_score,
    "topPredictions": top_predictions,
    "probabilities": result["all_probabilities"],
    "analysis": analysis,
}
    finally:
        if os.path.exists(saved_audio_path):
            os.remove(saved_audio_path)
            logger.info("Temporary file removed: %s", saved_audio_path)