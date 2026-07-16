# -*- coding: utf-8 -*-
"""
SukoonAI FastAPI Application Entrypoint
Multi-modal mental health assessment API (text + voice + PHQ-9 -> fusion + Gemini).

Run from the repository root:

    python -m uvicorn backend.app:app --reload

Running from the repo root ensures both the ``backend`` package and the
``models`` package resolve, and that upload paths land under ``backend/uploads``.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from pathlib import Path

# --- Path + env bootstrap (must run before importing routers/models) --------
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Load backend/.env (GEMINI_API_KEY, WHISPER_MODEL_SIZE, ...) into the
# process environment before any service reads it.
from dotenv import load_dotenv
load_dotenv(REPO_ROOT / "backend" / ".env")

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import questionnaire, sentiment, voice, final

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

# Upload directories (repo-root relative — the server runs from the repo root).
UPLOAD_DIRS = [
    REPO_ROOT / "backend" / "uploads" / "voice",
    REPO_ROOT / "backend" / "uploads" / "chat",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm every model once at startup so the first request isn't cold.

    Set SUKOON_SKIP_WARMUP=1 to skip (faster dev reloads; models then load
    lazily on first use instead).
    """
    for d in UPLOAD_DIRS:
        d.mkdir(parents=True, exist_ok=True)

    if os.getenv("SUKOON_SKIP_WARMUP") != "1":
        try:
            logger.info("Warming up models (sentiment + voice + whisper) ...")
            from models.fusion.fusion_engine import warmup
            warmup()
            logger.info("Model warmup complete.")
        except Exception:
            # Never let warmup failure block startup — models still load
            # lazily on first request, and the error is surfaced there.
            logger.exception("Model warmup failed; models will load lazily.")
    else:
        logger.info("SUKOON_SKIP_WARMUP=1 set; skipping startup warmup.")

    yield


app = FastAPI(
    title="SukoonAI Clinical API",
    description="Multi-Modal Predictive Mental Health Analytics Engine",
    version="3.0.0",
    lifespan=lifespan,
)

# CORS. The frontend is normally served same-origin via the Vite dev proxy,
# so credentials are not required. allow_credentials must be False when
# allow_origins is "*" (browsers reject the wildcard-with-credentials combo).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routing blueprints.
app.include_router(questionnaire.router, prefix="/api", tags=["Questionnaire"])
app.include_router(sentiment.router, prefix="/api", tags=["Sentiment"])
app.include_router(voice.router, prefix="/api", tags=["Voice"])
app.include_router(final.router, prefix="/api", tags=["Consolidated Report"])


@app.get("/", tags=["Diagnostic Status"])
async def root_status():
    return {
        "status": "online",
        "service": "SukoonAI Care Portal",
        "version": "3.0.0",
        "integrations": ["phq9", "nlp_sentiment", "voice_emotion", "fusion", "gemini"],
    }


if __name__ == "__main__":
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
