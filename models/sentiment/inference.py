import os
import json
import logging
import re
import torch

from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRANSFORMER_MODEL_DIR = "dakshupreti723/sukoon-sentiment"
LABEL_FILE = os.path.join(BASE_DIR, "label_encoder_classes.json")
MAX_LENGTH = 128
CONFIDENCE_THRESHOLD = 0.50

DEVICE = torch.device("cpu")  # Railway has no GPU; force CPU explicitly

_transformer_model = None
_transformer_tokenizer = None
_transformer_labels = None


def clean_text_transformer(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _load_transformer():
    global _transformer_model, _transformer_tokenizer, _transformer_labels
    if _transformer_model is None:
        logger.info("Loading sentiment transformer model ...")
        _transformer_tokenizer = AutoTokenizer.from_pretrained(TRANSFORMER_MODEL_DIR)
        _transformer_model = AutoModelForSequenceClassification.from_pretrained(
            TRANSFORMER_MODEL_DIR,
            torch_dtype=torch.bfloat16,   # bfloat16 has real CPU kernel support, unlike float16
            low_cpu_mem_usage=True,
        )
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
        probabilities = torch.softmax(outputs.logits.float(), dim=-1).squeeze()

    if probabilities.ndim == 0:
        probabilities = probabilities.unsqueeze(0)

    probabilities = probabilities.cpu().numpy()
    results = {label: float(prob) for label, prob in zip(labels, probabilities)}
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


def predict_sentiment(text: str) -> dict:
    if not isinstance(text, str):
        raise TypeError("Input must be a string.")
    if not text.strip():
        return {"prediction": None, "confidence": 0.0, "probabilities": {}}

    try:
        return _predict_transformer(text)
    except Exception as e:
        raise RuntimeError(f"Inference failed: {e}") from e