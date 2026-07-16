"""
train.py
========
End-to-end training entry point for Sukoon AI's voice emotion recognition
model (model2_voice).

Usage:
    python train.py

This will:
  1. Extract ravdess.zip (if needed) and build train/val/test tf.data
     pipelines.
  2. Build and compile the CNN + BiLSTM + Attention model.
  3. Train with EarlyStopping, ReduceLROnPlateau, and ModelCheckpoint.
  4. Evaluate on the held-out test set.
  5. Save the final model (voice_emotion_model.keras), the label encoder
     (label_encoder.pkl), training curves, a confusion matrix, and a
     classification report.
"""

import logging
import time

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.metrics import classification_report

import config
import dataset
import model as model_lib
from utils import (
    setup_logging,
    set_seed,
    ensure_dirs,
    save_label_encoder,
    plot_training_history,
    plot_confusion_matrix,
)

logger = setup_logging()


def build_callbacks():
    ensure_dirs()
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=config.EARLY_STOPPING_PATIENCE,
            restore_best_weights=True,
            verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=config.REDUCE_LR_FACTOR,
            patience=config.REDUCE_LR_PATIENCE,
            min_lr=config.MIN_LR,
            verbose=1,
        ),
        keras.callbacks.ModelCheckpoint(
            filepath=config.BEST_CHECKPOINT_PATH,
            monitor="val_loss",
            save_best_only=True,
            save_weights_only=False,
            verbose=1,
        ),
        keras.callbacks.CSVLogger(
            filename=str(config.LOGS_DIR) + "/training_log.csv",
            append=False,
        ),
        keras.callbacks.TerminateOnNaN(),
    ]
    return callbacks


def evaluate_on_test_set(model: keras.Model, test_ds: tf.data.Dataset, splits):
    """Run inference over the test set and produce a confusion matrix +
    classification report using the true integer labels (not one-hot)."""
    logger.info("Evaluating on held-out test set ...")

    y_true = []
    y_pred = []

    for batch_features, batch_labels_onehot in test_ds:
        preds = model.predict(batch_features, verbose=0)
        y_pred.extend(np.argmax(preds, axis=1).tolist())
        y_true.extend(np.argmax(batch_labels_onehot.numpy(), axis=1).tolist())

    class_names = list(splits.label_encoder.classes_)

    report = classification_report(
        y_true, y_pred, target_names=class_names, digits=4, zero_division=0
    )
    logger.info("Classification Report:\n" + report)

    with open(config.CLASSIFICATION_REPORT_PATH, "w") as f:
        f.write(report)

    plot_confusion_matrix(y_true, y_pred, class_names)

    return y_true, y_pred, report


def main():
    set_seed(config.RANDOM_SEED)
    ensure_dirs()

    logger.info("=" * 70)
    logger.info("Sukoon AI - Voice Emotion Recognition - Training Pipeline")
    logger.info("=" * 70)

    # ------------------------------------------------------------------
    # 1. Data
    # ------------------------------------------------------------------
    train_ds, val_ds, test_ds, splits = dataset.get_datasets()
    save_label_encoder(splits.label_encoder)

    # ------------------------------------------------------------------
    # 2. Model
    # ------------------------------------------------------------------
    model = model_lib.build_model()
    model = model_lib.compile_model(model)
    model.summary(print_fn=logger.info)

    # ------------------------------------------------------------------
    # 3. Train
    # ------------------------------------------------------------------
    callbacks = build_callbacks()

    start_time = time.time()
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.EPOCHS,
        callbacks=callbacks,
        verbose=1,
    )
    elapsed = time.time() - start_time
    logger.info(f"Training completed in {elapsed / 60:.2f} minutes.")

    # ------------------------------------------------------------------
    # 4. Plots
    # ------------------------------------------------------------------
    plot_training_history(history)

    # ------------------------------------------------------------------
    # 5. Test-set evaluation
    # ------------------------------------------------------------------
    test_metrics = model.evaluate(test_ds, verbose=1)
    metrics_names = model.metrics_names
    for name, value in zip(metrics_names, test_metrics):
        logger.info(f"Test {name}: {value:.4f}")

    evaluate_on_test_set(model, test_ds, splits)

    # ------------------------------------------------------------------
    # 6. Save final model
    # ------------------------------------------------------------------
    model.save(config.MODEL_SAVE_PATH)
    logger.info(f"Saved final model -> {config.MODEL_SAVE_PATH}")
    logger.info(f"Saved label encoder -> {config.LABEL_ENCODER_PATH}")
    logger.info("Training pipeline finished successfully.")


if __name__ == "__main__":
    main()