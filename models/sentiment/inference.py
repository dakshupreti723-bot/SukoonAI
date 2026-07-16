import os
import argparse
import json
import logging
import re
import torch

from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

# ==========================================================
# Configuration
# ==========================================================
MODEL_TYPE = "transformer"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BASELINE_MODEL_PATH = os.path.join(BASE_DIR, "baseline_model.joblib")
TRANSFORMER_MODEL_DIR = "dakshupreti723/sukoon-sentiment"
LABEL_FILE = os.path.join(BASE_DIR, "label_encoder_classes.json")
MAX_LENGTH = 128
CONFIDENCE_THRESHOLD = 0.50 # Risk mitigater for downstream alert fusion

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info("Sentiment model device: %s", DEVICE)


def clean_text_baseline(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z\s']", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def clean_text_transformer(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ==========================================================
# Model Singletons
# ==========================================================
_baseline_model = None
_transformer_model = None
_transformer_tokenizer = None
_transformer_labels = None


def _load_baseline():
    global _baseline_model
    if _baseline_model is None:
        import joblib
        _baseline_model = joblib.load(BASELINE_MODEL_PATH)
    return _baseline_model


def _predict_baseline(text: str) -> dict:
    model = _load_baseline()
    cleaned = clean_text_baseline(text)
    probabilities = model.predict_proba([cleaned])[0]
    classes = model.classes_

    results = {label: float(prob) for label, prob in zip(classes, probabilities)}
    results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
    
    prediction = max(results, key=results.get)
    confidence = results[prediction]
    
    # Apply Threshold Guard
    if confidence < CONFIDENCE_THRESHOLD:
        prediction = f"Uncertain (Low Confidence: {prediction})"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": results
    }


def _load_transformer():
    global _transformer_model, _transformer_tokenizer, _transformer_labels
    if _transformer_model is None:
        logger.info("Loading sentiment transformer model ...")
        _transformer_tokenizer = AutoTokenizer.from_pretrained(TRANSFORMER_MODEL_DIR)
        _transformer_model = AutoModelForSequenceClassification.from_pretrained(TRANSFORMER_MODEL_DIR)
        _transformer_model.to(DEVICE)
        _transformer_model.eval()

        with open(LABEL_FILE, "r", encoding="utf-8") as f:
            _transformer_labels = json.load(f)
        logger.info("Sentiment transformer loaded.")
    return _transformer_model, _transformer_tokenizer, _transformer_labels
    

def _predict_transformer(text: str) -> dict:
    model, tokenizer, labels = _load_transformer()
    cleaned = clean_text_transformer(text)

    inputs = tokenizer(cleaned, return_tensors="pt", truncation=True, max_length=MAX_LENGTH)
    inputs = {key: value.to(DEVICE) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1).squeeze()

    if probabilities.ndim == 0:
        probabilities = probabilities.unsqueeze(0)
        
    probabilities = probabilities.cpu().numpy()
    results = {label: float(prob) for label, prob in zip(labels, probabilities)}
    results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))

    prediction = next(iter(results))
    confidence = results[prediction]
    
    # FIXED: Threshold check ensures weak model states won't trigger critical system warnings
    if confidence < CONFIDENCE_THRESHOLD:
        prediction = f"Uncertain (Low Confidence: {prediction})"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": results
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
        if MODEL_TYPE.lower() == "baseline":
            return _predict_baseline(text)
        elif MODEL_TYPE.lower() == "transformer":
            return _predict_transformer(text)
        else:
            raise ValueError(f"Unknown MODEL_TYPE: {MODEL_TYPE}")
    except FileNotFoundError as e:
        raise FileNotFoundError("Model files not found. Please train the model first.") from e
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