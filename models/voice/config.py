"""
config.py
=========
Central configuration for the Sukoon AI voice emotion recognition model
(model2_voice).

All paths, hyperparameters, and constants used across the training,
dataset, feature extraction, and inference pipelines live here so that
every module stays in sync.
"""

import os

# --------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# The RAVDESS zip file the user places inside models/model2_voice/
ZIP_PATH = os.path.join(BASE_DIR, "ravdess.zip")

# Where the zip gets extracted to
DATA_DIR = os.path.join(BASE_DIR, "data")
RAVDESS_EXTRACT_DIR = os.path.join(DATA_DIR, "ravdess_raw")

# Artifacts produced by training
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
MODEL_DIR = os.path.join(ARTIFACTS_DIR, "model")
LOGS_DIR = os.path.join(ARTIFACTS_DIR, "logs")
PLOTS_DIR = os.path.join(ARTIFACTS_DIR, "plots")

# NOTE: The production-trained artifacts ship in the package root
# (models/voice/), not under artifacts/model/. Inference (predict.py)
# loads these two paths, so they must point at the real shipped files.
# Training (train.py) also writes the final model/encoder here, keeping
# the shipped location as the single source of truth.
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "voice_emotion_model.keras")
BEST_CHECKPOINT_PATH = os.path.join(MODEL_DIR, "best_checkpoint.keras")
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURE_SCALER_PATH = os.path.join(MODEL_DIR, "feature_scaler.pkl")

TRAINING_HISTORY_PLOT = os.path.join(PLOTS_DIR, "training_history.png")
CONFUSION_MATRIX_PLOT = os.path.join(PLOTS_DIR, "confusion_matrix.png")
CLASSIFICATION_REPORT_PATH = os.path.join(LOGS_DIR, "classification_report.txt")

# --------------------------------------------------------------------------
# Audio / signal processing parameters
# --------------------------------------------------------------------------
SAMPLE_RATE = 22050          # Hz
DURATION = 3.0               # seconds -> fixed clip length (pad/trim)
N_SAMPLES = int(SAMPLE_RATE * DURATION)

N_FFT = 2048
HOP_LENGTH = 512
WIN_LENGTH = 2048

N_MFCC = 40
N_MELS = 40
N_CHROMA = 12
N_CONTRAST_BANDS = 6          # librosa returns N_CONTRAST_BANDS + 1 rows

# Fixed number of time frames every feature matrix is padded/truncated to.
# ceil(N_SAMPLES / HOP_LENGTH) + 1 gives the natural frame count; we round
# up a little for safety margin against off-by-one differences between
# librosa feature extractors.
FIXED_FRAMES = int(N_SAMPLES / HOP_LENGTH) + 4

# Per-frame feature dimensionality:
#   MFCC (N_MFCC) + Delta (N_MFCC) + Delta-Delta (N_MFCC)
#   + Log-Mel Spectrogram (N_MELS)
#   + Chroma (N_CHROMA)
#   + Spectral Contrast (N_CONTRAST_BANDS + 1)
#   + RMS (1)
#   + Zero Crossing Rate (1)
FEATURE_DIM = (
    N_MFCC * 3
    + N_MELS
    + N_CHROMA
    + (N_CONTRAST_BANDS + 1)
    + 1
    + 1
)

INPUT_SHAPE = (FIXED_FRAMES, FEATURE_DIM)

# --------------------------------------------------------------------------
# RAVDESS label mapping
# --------------------------------------------------------------------------
# RAVDESS filename convention (speech + song):
# modality-vocalChannel-emotion-intensity-statement-repetition-actor.wav
# Emotion code -> human readable label
RAVDESS_EMOTION_MAP = {
    "01": "neutral",
    "02": "calm",
    "03": "happy",
    "04": "sad",
    "05": "angry",
    "06": "fearful",
    "07": "disgust",
    "08": "surprised",
}

EMOTION_LABELS = [
    "neutral",
    "calm",
    "happy",
    "sad",
    "angry",
    "fearful",
    "disgust",
    "surprised",
]

NUM_CLASSES = len(EMOTION_LABELS)

# --------------------------------------------------------------------------
# Dataset split parameters
# --------------------------------------------------------------------------
TEST_SIZE = 0.15
VAL_SIZE = 0.15   # fraction of the remaining (non-test) data
RANDOM_SEED = 42

# --------------------------------------------------------------------------
# Training hyperparameters
# --------------------------------------------------------------------------
BATCH_SIZE = 32
EPOCHS = 120
LEARNING_RATE = 1e-3
LABEL_SMOOTHING = 0.05

EARLY_STOPPING_PATIENCE = 15
REDUCE_LR_PATIENCE = 6
REDUCE_LR_FACTOR = 0.5
MIN_LR = 1e-6

# Augmentation probability applied per-sample during training
AUGMENT_PROB = 0.5

# Model architecture hyperparameters
CONV_FILTERS = [64, 128, 256]
CONV_KERNEL_SIZE = 5
CONV_DROPOUT = 0.3

LSTM_UNITS = [128, 64]
LSTM_DROPOUT = 0.3

ATTENTION_UNITS = 128

DENSE_UNITS = 128
DENSE_DROPOUT = 0.4

# --------------------------------------------------------------------------
# Misc
# --------------------------------------------------------------------------
NUM_PARALLEL_CALLS = os.cpu_count() or 4
SHUFFLE_BUFFER = 512