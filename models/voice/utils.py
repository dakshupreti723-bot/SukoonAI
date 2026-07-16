"""
utils.py
========
Shared utility helpers: reproducibility, directory management,
serialization of the label encoder / scaler, and plotting utilities
(training curves + confusion matrix).
"""

import os
import pickle
import random
import logging

import numpy as np

from . import config

logger = logging.getLogger("sukoon_voice")


def setup_logging(level=logging.INFO):
    """Configure a simple, consistent logger for the whole pipeline."""
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    return logger


def set_seed(seed: int = config.RANDOM_SEED):
    """Set all relevant random seeds for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    try:
        import tensorflow as tf
        tf.random.set_seed(seed)
    except ImportError:
        pass
    os.environ["PYTHONHASHSEED"] = str(seed)


def ensure_dirs():
    """Create every directory the pipeline expects to write into."""
    for d in [
        config.DATA_DIR,
        config.RAVDESS_EXTRACT_DIR,
        config.ARTIFACTS_DIR,
        config.MODEL_DIR,
        config.LOGS_DIR,
        config.PLOTS_DIR,
    ]:
        os.makedirs(d, exist_ok=True)


def save_pickle(obj, path: str):
    ensure_parent(path)
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    logger.info(f"Saved pickle artifact -> {path}")


def load_pickle(path: str):
    with open(path, "rb") as f:
        return pickle.load(f)


def ensure_parent(path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)


def save_label_encoder(label_encoder, path: str = config.LABEL_ENCODER_PATH):
    save_pickle(label_encoder, path)


def load_label_encoder(path: str = config.LABEL_ENCODER_PATH):
    return load_pickle(path)


# --------------------------------------------------------------------------
# Plotting
# --------------------------------------------------------------------------
def plot_training_history(history, save_path: str = config.TRAINING_HISTORY_PLOT):
    """Plot loss & accuracy curves for train/validation and save to disk."""
    import matplotlib
    matplotlib.use("Agg")  # headless-safe backend
    import matplotlib.pyplot as plt

    ensure_parent(save_path)
    hist = history.history

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy
    if "accuracy" in hist:
        axes[0].plot(hist["accuracy"], label="Train Accuracy", linewidth=2)
    if "val_accuracy" in hist:
        axes[0].plot(hist["val_accuracy"], label="Validation Accuracy", linewidth=2)
    axes[0].set_title("Model Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend(loc="lower right")
    axes[0].grid(alpha=0.3)

    # Loss
    axes[1].plot(hist["loss"], label="Train Loss", linewidth=2)
    if "val_loss" in hist:
        axes[1].plot(hist["val_loss"], label="Validation Loss", linewidth=2)
    axes[1].set_title("Model Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend(loc="upper right")
    axes[1].grid(alpha=0.3)

    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    logger.info(f"Saved training history plot -> {save_path}")


def plot_confusion_matrix(y_true, y_pred, class_names,
                           save_path: str = config.CONFUSION_MATRIX_PLOT,
                           normalize: bool = True):
    """Compute and save a confusion matrix heatmap."""
    import matplotlib
    matplotlib.use("Agg")  # headless-safe backend
    import matplotlib.pyplot as plt
    import seaborn as sns
    from sklearn.metrics import confusion_matrix

    ensure_parent(save_path)
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))

    if normalize:
        with np.errstate(all="ignore"):
            cm_display = cm.astype("float") / cm.sum(axis=1, keepdims=True)
            cm_display = np.nan_to_num(cm_display)
        fmt = ".2f"
    else:
        cm_display = cm
        fmt = "d"

    fig, ax = plt.subplots(figsize=(9, 7))
    sns.heatmap(
        cm_display,
        annot=True,
        fmt=fmt,
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax,
        cbar=True,
    )
    ax.set_xlabel("Predicted Label")
    ax.set_ylabel("True Label")
    ax.set_title("Confusion Matrix" + (" (Normalized)" if normalize else ""))
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    logger.info(f"Saved confusion matrix plot -> {save_path}")
    return cm