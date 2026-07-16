# Sukoon AI — Multimodal Mental Health Assessment Platform

Sukoon AI combines three independent signals plus a fusion engine and a
compassionate AI companion into one wellness assessment:

1. **Text sentiment (NLP)** — a transformer classifier over journal/chat text
   (`Anxiety, Bipolar, Depression, Normal, Personality disorder, Stress, Suicidal`).
2. **Voice emotion** — a CNN + BiLSTM + Attention Keras model over acoustic
   features (RAVDESS emotions).
3. **PHQ-9** — the standard clinically-validated questionnaire.
4. **Fusion engine** — weights the three signals into a `Low / Medium / High`
   risk level with hard safety overrides for self-harm/suicidal ideation.
5. **Gemini companion** — turns the *structured* result into a compassionate,
   non-diagnostic support message with recommendations and safety guidance.

> This is a wellness self-reflection aid, **not** a diagnostic or clinical tool.

---

## Architecture

- **`frontend/`** — React + Vite + Tailwind SPA (the active app; `index.html`
  loads `frontend/src/main.tsx`). Talks to the backend over `/api/*`.
- **`backend/`** — FastAPI service. `app.py` is the entrypoint; `routes/` holds
  the per-module endpoints; `services/gemini_service.py` wraps Gemini.
- **`models/`** — the trained models and their inference code
  (`sentiment/`, `voice/`, `fusion/`, `questionnaire/`).

### API (FastAPI, port 8000)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/questionnaire` | PHQ-9 score + severity |
| POST | `/api/sentiment` | Text sentiment classification |
| POST | `/api/voice` | Voice emotion classification |
| POST | `/api/final` | **Consolidated**: fusion + Gemini, returns the full report |

`/api/final` returns:
`{ text_prediction, voice_prediction, phq9, face_prediction, fusion, gemini }`.

---

## Getting Started

### 1. Backend (Python 3.13)

The ML stack (TensorFlow) needs a short install path on Windows, so use a venv
at a short path (e.g. `C:\skv`):

```bash
python -m venv C:\skv
C:\skv\Scripts\python -m pip install -r backend/requirements.txt
# PyTorch CPU build (if not already resolved):
C:\skv\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

Add your Gemini key to `backend/.env`:

```
GEMINI_API_KEY=your_key_here
# optional overrides:
# GEMINI_MODEL=gemini-flash-latest
# WHISPER_MODEL_SIZE=base
```

Run the API from the **repository root** (so `backend` and `models` both resolve):

```bash
C:\skv\Scripts\python -m uvicorn backend.app:app --reload
```

Models warm up once at startup. Set `SUKOON_SKIP_WARMUP=1` for faster dev
reloads (models then load lazily on first request).

### 2. Frontend

```bash
npm install
npm run dev      # Vite dev server; proxies /api -> http://localhost:8000
```

Open the printed URL. To point at a different backend, set `VITE_API_TARGET`.

```bash
npm run build    # production build to dist/
npm run lint     # tsc typecheck
```

---

## Notes

- Audio is converted to 16-bit PCM WAV **in the browser** before upload, so the
  backend decodes it with librosa/soundfile — no ffmpeg required.
- No face-emotion model ships in this repo; the `face_prediction` slot in the
  final report is always `null` and the pipeline runs without it.
