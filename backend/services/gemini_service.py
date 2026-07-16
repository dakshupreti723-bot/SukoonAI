# -*- coding: utf-8 -*-
"""
backend/services/gemini_service.py

Turns the *structured* multi-modal assessment (text + voice + PHQ-9 + fusion)
into a compassionate, non-diagnostic support response using Google Gemini.

Design rules (enforced in the prompt AND the fallback):
  - Only structured signals are sent to Gemini, never the raw journal text.
  - The response never diagnoses and always states it is an AI assistant,
    not a licensed psychologist.
  - When risk is High or a safety override fired (suicidal ideation), the
    response surfaces emergency guidance + helpline.
  - If the Gemini call fails for any reason, a safe rule-based fallback is
    returned so the API always produces a usable payload.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# "gemini-flash-latest" is a stable alias that always points at the current
# production Flash model, so this stays working as specific versions are
# retired. Override with the GEMINI_MODEL env var if needed.
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
DISCLAIMER = (
    "This is an AI wellness assistant, not a licensed psychologist or medical "
    "professional. It does not provide a diagnosis. If you are struggling, please "
    "reach out to a qualified mental health professional or a helpline."
)


# --------------------------------------------------------------------------
# Structured output contract (also used as the Gemini response schema).
# --------------------------------------------------------------------------
class GeminiSupport(BaseModel):
    message: str = Field(description="A warm, compassionate opening addressed to the user.")
    summary: str = Field(description="Personalized emotional summary of what the signals suggest, non-diagnostic.")
    recommendations: list[str] = Field(default_factory=list, description="Actionable mental-wellness recommendations.")
    coping: list[str] = Field(default_factory=list, description="Concrete coping strategies the user can try now.")
    lifestyle: list[str] = Field(default_factory=list, description="Lifestyle suggestions (movement, nutrition, social).")
    daily_habits: list[str] = Field(default_factory=list, description="Small daily habits to build over time.")
    sleep: list[str] = Field(default_factory=list, description="Sleep recommendations.")
    mindfulness: list[str] = Field(default_factory=list, description="Breathing or mindfulness exercises with brief how-to.")
    when_to_seek_help: str = Field(default="", description="Plain guidance on when to consider talking to a professional.")
    professional_help: bool = Field(description="Whether seeing a professional is recommended.")
    # emergency / emergency_guidance are authoritative from the fusion engine
    # and are overwritten server-side after generation (see generate_support).
    emergency: bool = Field(description="Acute-risk flag; overwritten by the fusion decision server-side.")
    emergency_guidance: str = Field(default="", description="Immediate safety guidance; empty when not an emergency.")
    disclaimer: str = Field(default=DISCLAIMER)


SYSTEM_INSTRUCTION = (
    "You are Sukoon AI, a warm, supportive mental-wellness assistant. "
    "You are NOT a licensed psychologist, therapist, or doctor, and you must "
    "never state or imply a clinical diagnosis. You receive only structured, "
    "already-computed signals from a screening pipeline (a PHQ-9 score, a text "
    "sentiment classification with confidence, a voice-emotion classification, "
    "and a fused risk level). Speak directly to the user with empathy and hope, "
    "in clear, simple, non-clinical language. Base your guidance on the provided "
    "signals; do not invent specifics you were not given.\n\n"
    "The prompt tells you the MODE, which is decided by the screening pipeline — "
    "you must NOT change it:\n"
    "- MODE=SUPPORTIVE (low/moderate risk): Always produce a full, personalized "
    "set of guidance — an emotional summary, coping strategies, lifestyle "
    "suggestions, daily habits, sleep recommendations, and breathing/mindfulness "
    "exercises — and give plain guidance on when to consider talking to a "
    "professional. Do NOT write crisis/emergency language and leave "
    "emergency_guidance empty.\n"
    "- MODE=CRISIS (high risk or a self-harm/suicidal safety override): Lead with "
    "a calm, caring, hopeful message, clearly and gently urge the person to seek "
    "immediate support, and put that in emergency_guidance including the provided "
    "helpline. Still include gentle grounding/coping and mindfulness items.\n\n"
    "Always keep a caring, non-judgmental tone."
)


def is_emergency(assessment: dict) -> bool:
    """Authoritative acute-risk decision — the SINGLE source of truth.

    Emergency iff the FUSION ENGINE (not any single model) rates the person
    High risk, OR the fusion detected a self-harm/suicidal safety override,
    OR the PHQ-9 self-harm item was endorsed. This uses all signals because
    the fused risk level and override already combine PHQ-9, sentiment (class +
    confidence), and voice emotion.
    """
    fusion = assessment.get("fusion") or {}
    phq9 = assessment.get("phq9") or {}
    return bool(
        fusion.get("risk_level") == "High"
        or fusion.get("overridden")
        or phq9.get("item9_flag")
    )


# --------------------------------------------------------------------------
# Lazy client singleton
# --------------------------------------------------------------------------
_CLIENT = None


def _get_client():
    """Create and cache the Gemini client. Returns None if no API key is set."""
    global _CLIENT
    if _CLIENT is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set; Gemini responses will use fallback.")
            return None
        from google import genai
        _CLIENT = genai.Client(api_key=api_key)
    return _CLIENT


def _build_prompt(assessment: dict) -> str:
    """Serialize ONLY the structured signals (never the raw journal) for Gemini."""
    text = assessment.get("text_prediction") or {}
    voice = assessment.get("voice_prediction") or {}
    phq9 = assessment.get("phq9") or {}
    fusion = assessment.get("fusion") or {}
    helpline = fusion.get("helpline")
    emergency = is_emergency(assessment)
    mode = "CRISIS" if emergency else "SUPPORTIVE"

    lines = [
        f"MODE={mode}  (decided by the screening pipeline — do not change it)",
        "",
        "Here are the structured screening signals for one person:",
        f"- PHQ-9 total: {phq9.get('total')} / 27 (severity: {phq9.get('severity')}); "
        f"self-harm item endorsed: {phq9.get('item9_flag')}",
        f"- Text sentiment classification: {text.get('prediction')} "
        f"(confidence {text.get('confidence')})",
        f"- Voice emotion classification: {voice.get('emotion')} "
        f"(confidence {voice.get('confidence')})",
        f"- Fused risk level: {fusion.get('risk_level')} "
        f"(fused score {fusion.get('fused_score')})",
        f"- Safety override active: {fusion.get('overridden')} "
        f"(reason: {fusion.get('override_reason')})",
    ]
    # Only surface the helpline to the model in CRISIS mode, so supportive
    # responses don't reference emergency resources.
    if emergency and helpline:
        lines.append(f"- Helpline to share: {helpline.get('name')} — {helpline.get('number')}")

    if emergency:
        lines.append(
            "\nWrite a caring CRISIS-mode response: a hopeful message, immediate "
            "safety guidance in emergency_guidance (include the helpline), plus "
            "gentle grounding/mindfulness. Non-diagnostic."
        )
    else:
        lines.append(
            "\nWrite a SUPPORTIVE-mode response with a personalized emotional "
            "summary, coping strategies, lifestyle suggestions, daily habits, "
            "sleep recommendations, and breathing/mindfulness exercises, plus "
            "when_to_seek_help guidance. Leave emergency_guidance empty. "
            "Non-diagnostic."
        )
    return "\n".join(lines)


def _fallback(assessment: dict) -> dict:
    """Safe rule-based response used when Gemini is unavailable or errors."""
    fusion = assessment.get("fusion") or {}
    risk = fusion.get("risk_level", "Low")
    helpline = fusion.get("helpline") or {}
    emergency = is_emergency(assessment)

    emergency_guidance = ""
    if emergency:
        hl = f" You can contact {helpline.get('name')} at {helpline.get('number')}." if helpline else ""
        emergency_guidance = (
            "Some of your responses suggest you may be going through a very hard time. "
            "Please reach out for immediate support right now — talk to someone you trust "
            "or contact a crisis helpline." + hl
        )

    return {
        "message": "Thank you for taking the time to check in with yourself today. "
                   "That takes real courage, and you deserve support.",
        "summary": f"Your combined screening signals point to a {risk.lower()} overall "
                   "level of distress. This is a reflection aid, not a diagnosis.",
        "recommendations": [
            "Consider talking with someone you trust about how you've been feeling.",
            "Keep a simple daily check-in with your mood and energy.",
        ],
        "coping": [
            "Try slow box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.",
            "Ground yourself by naming 5 things you can see, 4 you can hear, 3 you can touch.",
        ],
        "lifestyle": [
            "Try some gentle daily movement, like a short walk outdoors.",
            "Stay connected with supportive people.",
            "Eat regular, nourishing meals and stay hydrated.",
        ],
        "daily_habits": [
            "Set one small, achievable goal for the day.",
            "Take short screen breaks and step outside for a few minutes.",
        ],
        "sleep": [
            "Aim for a consistent sleep and wake time.",
            "Wind down without screens for 30 minutes before bed.",
        ],
        "mindfulness": [
            "4-7-8 breathing: inhale 4s, hold 7s, exhale 8s, a few rounds.",
            "A 3-minute body scan, noticing tension and letting it soften.",
        ],
        "when_to_seek_help": (
            "If these feelings persist for more than two weeks, worsen, or start "
            "affecting your daily life, consider talking with a mental-health professional."
        ),
        "professional_help": risk in ("Medium", "High") or emergency,
        "emergency": emergency,
        "emergency_guidance": emergency_guidance,
        "disclaimer": DISCLAIMER,
    }


def generate_support(assessment: dict) -> dict:
    """Produce the structured Gemini support block for a completed assessment.

    Always returns a dict matching GeminiSupport; never raises.
    """
    client = _get_client()
    if client is None:
        return _fallback(assessment)

    try:
        from google.genai import types

        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=_build_prompt(assessment),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=GeminiSupport,
                temperature=0.7,
            ),
        )

        parsed = getattr(response, "parsed", None)
        if isinstance(parsed, GeminiSupport):
            data = parsed.model_dump()
        elif isinstance(parsed, dict):
            data = GeminiSupport(**parsed).model_dump()
        else:
            import json
            data = GeminiSupport(**json.loads(response.text)).model_dump()

        # The emergency flag is authoritative from the FUSION ENGINE, not from
        # the language model. Force it in BOTH directions so the model can
        # neither raise a false alarm on a low/moderate case nor suppress a
        # real one. This is what drives the frontend's card switch.
        emergency = is_emergency(assessment)
        data["emergency"] = emergency
        if emergency:
            if not data.get("emergency_guidance"):
                data["emergency_guidance"] = _fallback(assessment)["emergency_guidance"]
        else:
            # Non-emergency: strip any crisis language the model may have added.
            data["emergency_guidance"] = ""
        if not data.get("disclaimer"):
            data["disclaimer"] = DISCLAIMER
        return data

    except Exception:
        logger.exception("Gemini generation failed; using fallback.")
        return _fallback(assessment)
