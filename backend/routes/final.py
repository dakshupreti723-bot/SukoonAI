# -*- coding: utf-8 -*-
"""
backend/routes/final.py

Final consolidated assessment route. This route performs NO scoring of
its own — it collects the PHQ-9 responses, journal text, and voice
recording, hands them to the production fusion engine, and returns the
fusion engine's result unmodified.

models/fusion/fusion_engine.py is the single source of truth for all
depression scoring, risk banding, recommendation text, and safety
overrides.
"""

import json
import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.fusion.fusion_engine import run_pipeline
from backend.services.gemini_service import generate_support

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

router = APIRouter()

UPLOAD_DIR = str(Path(__file__).resolve().parents[1] / "uploads" / "voice")
ALLOWED_EXTENSIONS = (".wav", ".mp3", ".ogg", ".m4a", ".webm")


@router.post("/final")
async def evaluate_final_consolidated_report(
    phq9_responses: str = Form(..., description="JSON array of 9 ints, e.g. [1,2,0,1,0,0,1,0,0]"),
    journal_text: str = Form(...),
    voice_audio: UploadFile = File(...),
):
    logger.info("Final assessment requested")

    # --- Parse PHQ-9 responses -------------------------------------
    try:
        parsed_phq9_responses = json.loads(phq9_responses)
        if not isinstance(parsed_phq9_responses, list):
            raise ValueError("phq9_responses must be a JSON array of ints.")
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid phq9_responses payload: {exc}") from exc

    # --- Validate and persist the uploaded audio --------------------
    if not voice_audio.filename.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="Invalid audio file layout. Please submit a WAV, MP3, OGG, or M4A file.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_extension = os.path.splitext(voice_audio.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    saved_audio_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(saved_audio_path, "wb") as buffer:
            buffer.write(await voice_audio.read())

        # --- Delegate all scoring to the fusion engine ---------------
        logger.info("Fusion started")
        try:
            assessment = run_pipeline(
                phq9_responses=parsed_phq9_responses,
                journal_text=journal_text,
                audio_path=saved_audio_path,
            )
        except Exception as exc:
            logger.exception("Fusion pipeline failed")
            raise HTTPException(
                status_code=500,
                detail=f"Fusion pipeline failed: {exc}",
            ) from exc
        logger.info("Fusion completed")

        # Optional face model is not present in this repository; expose the
        # slot so the frontend contract stays stable.
        assessment["face_prediction"] = None

        # --- Gemini compassionate support (never raises) -------------
        logger.info("Gemini generation started")
        assessment["gemini"] = generate_support(assessment)
        logger.info("Gemini generation completed")

        # Final consolidated structured contract:
        #   text_prediction, voice_prediction, phq9, face_prediction,
        #   fusion, gemini
        return assessment
    finally:
        if os.path.exists(saved_audio_path):
            os.remove(saved_audio_path)
            logger.info("Temporary file removed: %s", saved_audio_path)