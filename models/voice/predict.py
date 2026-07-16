"""
predict.py
==========
Command-line inference script for Sukoon AI's voice emotion recognition
model.

Usage:
    python predict.py --audio path/to/clip.wav
    python predict.py --audio path/to/clip.wav --model path/to/model.keras
"""

import argparse
import json
import logging

import numpy as np
import tensorflow as tf
from tensorflow import keras

from . import config
from . import feature_extractor
from .utils import setup_logging, load_label_encoder
from .model import AttentionLayer

logger = setup_logging()


def load_model(model_path: str = config.MODEL_SAVE_PATH) -> keras.Model:
    logger.info(f"Loading model from {model_path} ...")
    model = keras.models.load_model(
        model_path,
        custom_objects={"AttentionLayer": AttentionLayer},
    )
    return model


# --------------------------------------------------------------------------
# Load-once singletons. The Keras model and label encoder are expensive to
# load, so cache them process-wide and reuse across every request instead of
# reloading per call. Call warmup() at server startup to pay this cost once.
# --------------------------------------------------------------------------
_MODEL = None
_LABEL_ENCODER = None


def get_model(model_path: str = config.MODEL_SAVE_PATH) -> keras.Model:
    global _MODEL
    if _MODEL is None:
        _MODEL = load_model(model_path)
    return _MODEL


def get_label_encoder(label_encoder_path: str = config.LABEL_ENCODER_PATH):
    global _LABEL_ENCODER
    if _LABEL_ENCODER is None:
        _LABEL_ENCODER = load_label_encoder(label_encoder_path)
    return _LABEL_ENCODER


def warmup() -> None:
    """Eagerly load the model + label encoder (used at server startup)."""
    get_model()
    get_label_encoder()


def predict_emotion(audio_path: str,
                     model: keras.Model = None,
                     model_path: str = config.MODEL_SAVE_PATH,
                     label_encoder=None,
                     label_encoder_path: str = config.LABEL_ENCODER_PATH,
                     top_k: int = 3) -> dict:
    """
    Run the full pipeline on a single audio file and return a dict with the
    predicted emotion, confidence, and the top-k probability breakdown.
    """
    if model is None:
        model = get_model(model_path)
    if label_encoder is None:
        label_encoder = get_label_encoder(label_encoder_path)

    features = feature_extractor.extract_features_from_path(audio_path, augment=False)
    features_batch = np.expand_dims(features, axis=0).astype(np.float32)

    probabilities = model.predict(features_batch, verbose=0)[0]

    # Cast to plain str so np.str_ never leaks into the JSON response.
    class_names = [str(c) for c in label_encoder.classes_]
    ranked_indices = np.argsort(probabilities)[::-1]

    top_k_results = [
        {"emotion": class_names[i], "probability": float(probabilities[i])}
        for i in ranked_indices[:top_k]
    ]

    result = {
        "audio_path": audio_path,
        "predicted_emotion": class_names[ranked_indices[0]],
        "confidence": float(probabilities[ranked_indices[0]]),
        "top_k": top_k_results,
        "all_probabilities": {
            class_names[i]: float(probabilities[i]) for i in range(len(class_names))
        },
    }
    return result


def main():
    parser = argparse.ArgumentParser(description="Sukoon AI - Voice Emotion Prediction")
    parser.add_argument("--audio", type=str, required=True, help="Path to a .wav audio file")
    parser.add_argument("--model", type=str, default=config.MODEL_SAVE_PATH,
                         help="Path to the trained .keras model")
    parser.add_argument("--label_encoder", type=str, default=config.LABEL_ENCODER_PATH,
                         help="Path to the saved label_encoder.pkl")
    parser.add_argument("--top_k", type=int, default=3, help="Number of top predictions to display")
    args = parser.parse_args()

    result = predict_emotion(
        audio_path=args.audio,
        model_path=args.model,
        label_encoder_path=args.label_encoder,
        top_k=args.top_k,
    )

    print(json.dumps(result, indent=2))
    logger.info(
        f"Predicted emotion: {result['predicted_emotion']} "
        f"(confidence: {result['confidence']:.4f})"
    )


if __name__ == "__main__":
    main()