import os
import argparse
import json
import logging
import re
from urllib import response
import requests

logger = logging.getLogger(__name__)

# ==========================================================
# Configuration
# ==========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LABEL_FILE = os.path.join(BASE_DIR, "label_encoder_classes.json")
CONFIDENCE_THRESHOLD = 0.50  # Risk mitigater for downstream alert fusion

HF_MODEL_ID = "dakshupreti723/sukoon-sentiment"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL_ID}"
HF_TOKEN = os.getenv("HF_TOKEN")


def clean_text_transformer(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _predict_transformer(text: str) -> dict:
    cleaned = clean_text_transformer(text)

    response = requests.post(
    HF_API_URL,
    headers={"Authorization": f"Bearer {HF_TOKEN}"},
    json={"inputs": cleaned},
    timeout=30,
    )
    if response.status_code != 200:
        logger.error("HF API error %s: %s", response.status_code, response.text)
    response.raise_for_status()
    raw = response.json()

    # HF Inference API returns: [[{"label": "...", "score": ...}, ...]]
    if isinstance(raw, dict) and "error" in raw:
        raise RuntimeError(f"HF Inference API error: {raw['error']}")

    predictions = raw[0] if isinstance(raw[0], list) else raw
    results = {p["label"]: float(p["score"]) for p in predictions}
    results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))

    prediction = next(iter(results))
    confidence = results[prediction]

    if confidence < CONFIDENCE_THRESHOLD:
        prediction = f"Uncertain (Low Confidence: {prediction})"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": results,
    }


# ==========================================================
# Public API
# ==========================================================
def predict_sentiment(text: str) -> dict:
    if not isinstance(text, str):
        raise TypeError("Input must be a string.")
    if not text.strip():
        return {"prediction": None, "confidence": 0.0, "probabilities": {}}

    try:
        return _predict_transformer(text)
    except Exception as e:
        raise RuntimeError(f"Inference failed: {e}") from e


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mental Health Sentiment Inference")
    parser.add_argument("--text", required=True, help="Input sentence")
    args = parser.parse_args()

    result = predict_sentiment(args.text)
    print("\nPrediction")
    print("-" * 40)
    print(f"Predicted Class : {result['prediction']}")
    print(f"Confidence      : {result['confidence']:.4f}")

    print("\nClass Probabilities")
    print("-" * 40)
    for label, probability in result["probabilities"].items():
        print(f"{label:<20} {probability:.4f}")