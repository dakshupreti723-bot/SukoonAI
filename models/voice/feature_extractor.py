"""
feature_extractor.py
=====================
Audio loading, waveform augmentation, and acoustic feature extraction for
the Sukoon AI voice emotion recognition model.

For every audio clip we build a (FIXED_FRAMES, FEATURE_DIM) matrix by
stacking, frame-by-frame, the following features along the feature axis:

    - MFCC                    (N_MFCC)
    - Delta MFCC              (N_MFCC)
    - Delta-Delta MFCC        (N_MFCC)
    - Log-Mel Spectrogram     (N_MELS)
    - Chroma STFT             (N_CHROMA)
    - Spectral Contrast       (N_CONTRAST_BANDS + 1)
    - RMS Energy              (1)
    - Zero Crossing Rate      (1)

All features share the same n_fft / hop_length so their time axes align.
The resulting matrix is padded or truncated to config.FIXED_FRAMES frames.
"""

import logging

import numpy as np
import librosa

from . import config

logger = logging.getLogger("sukoon_voice")


# --------------------------------------------------------------------------
# Audio I/O
# --------------------------------------------------------------------------
def load_audio(path: str, sr: int = config.SAMPLE_RATE) -> np.ndarray:
    """Load an audio file, resample to `sr`, and pad/trim to a fixed length."""
    try:
        y, _ = librosa.load(path, sr=sr, mono=True)
    except Exception as exc:  # pragma: no cover - defensive
        logger.error(f"Failed to load audio file {path}: {exc}")
        raise

    y = fix_length(y, config.N_SAMPLES)
    return y


def fix_length(y: np.ndarray, n_samples: int) -> np.ndarray:
    """Pad with zeros or trim the waveform to exactly `n_samples` samples."""
    if len(y) > n_samples:
        # Center-crop so we don't always lose the trailing (often meaningful) audio
        start = (len(y) - n_samples) // 2
        return y[start:start + n_samples]
    if len(y) < n_samples:
        pad_total = n_samples - len(y)
        pad_left = pad_total // 2
        pad_right = pad_total - pad_left
        return np.pad(y, (pad_left, pad_right), mode="constant")
    return y


# --------------------------------------------------------------------------
# Waveform augmentation (applied only to the training split)
# --------------------------------------------------------------------------
def add_white_noise(y: np.ndarray, noise_factor: float = None) -> np.ndarray:
    noise_factor = noise_factor if noise_factor is not None else np.random.uniform(0.001, 0.01)
    noise = np.random.randn(len(y))
    return (y + noise_factor * noise).astype(np.float32)


def pitch_shift(y: np.ndarray, sr: int = config.SAMPLE_RATE, n_steps: float = None) -> np.ndarray:
    n_steps = n_steps if n_steps is not None else np.random.uniform(-2.5, 2.5)
    return librosa.effects.pitch_shift(y=y, sr=sr, n_steps=n_steps).astype(np.float32)


def time_stretch(y: np.ndarray, rate: float = None) -> np.ndarray:
    rate = rate if rate is not None else np.random.uniform(0.85, 1.15)
    y_stretched = librosa.effects.time_stretch(y=y, rate=rate)
    return fix_length(y_stretched, config.N_SAMPLES).astype(np.float32)


def time_shift(y: np.ndarray, shift_max_ratio: float = 0.2) -> np.ndarray:
    shift = int(np.random.uniform(-shift_max_ratio, shift_max_ratio) * len(y))
    return np.roll(y, shift).astype(np.float32)


def gain_scale(y: np.ndarray, gain_db: float = None) -> np.ndarray:
    gain_db = gain_db if gain_db is not None else np.random.uniform(-6, 6)
    factor = 10 ** (gain_db / 20)
    return (y * factor).astype(np.float32)


AUGMENTATIONS = [add_white_noise, pitch_shift, time_stretch, time_shift, gain_scale]


def augment_waveform(y: np.ndarray, sr: int = config.SAMPLE_RATE,
                      prob: float = config.AUGMENT_PROB) -> np.ndarray:
    """Randomly apply zero, one, or two augmentations to the waveform."""
    y_aug = y.copy()
    for fn in AUGMENTATIONS:
        if np.random.rand() < prob / len(AUGMENTATIONS) * 2:
            try:
                if fn in (pitch_shift,):
                    y_aug = fn(y_aug, sr=sr)
                else:
                    y_aug = fn(y_aug)
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning(f"Augmentation {fn.__name__} failed, skipping: {exc}")
    y_aug = fix_length(y_aug, config.N_SAMPLES)
    return y_aug.astype(np.float32)


# --------------------------------------------------------------------------
# Feature extraction
# --------------------------------------------------------------------------
def _pad_or_truncate(feat: np.ndarray, n_frames: int) -> np.ndarray:
    """feat has shape (n_features, T). Pad/truncate T -> n_frames."""
    t = feat.shape[1]
    if t > n_frames:
        return feat[:, :n_frames]
    if t < n_frames:
        pad_width = n_frames - t
        return np.pad(feat, ((0, 0), (0, pad_width)), mode="constant")
    return feat


def extract_features(y: np.ndarray, sr: int = config.SAMPLE_RATE) -> np.ndarray:
    """
    Build the full (FIXED_FRAMES, FEATURE_DIM) feature matrix for a single
    fixed-length waveform.
    """
    n_fft = config.N_FFT
    hop = config.HOP_LENGTH
    n_frames = config.FIXED_FRAMES

    # --- MFCC + deltas -----------------------------------------------------
    mfcc = librosa.feature.mfcc(
        y=y, sr=sr, n_mfcc=config.N_MFCC, n_fft=n_fft, hop_length=hop
    )
    mfcc_delta = librosa.feature.delta(mfcc, order=1)
    mfcc_delta2 = librosa.feature.delta(mfcc, order=2)

    # --- Log-Mel spectrogram -------------------------------------------------
    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_fft=n_fft, hop_length=hop, n_mels=config.N_MELS
    )
    log_mel = librosa.power_to_db(mel, ref=np.max)

    # --- Chroma ---------------------------------------------------------------
    chroma = librosa.feature.chroma_stft(
        y=y, sr=sr, n_fft=n_fft, hop_length=hop, n_chroma=config.N_CHROMA
    )

    # --- Spectral contrast ------------------------------------------------------
    contrast = librosa.feature.spectral_contrast(
        y=y, sr=sr, n_fft=n_fft, hop_length=hop, n_bands=config.N_CONTRAST_BANDS
    )

    # --- RMS energy -------------------------------------------------------------
    rms = librosa.feature.rms(y=y, frame_length=n_fft, hop_length=hop)

    # --- Zero crossing rate -------------------------------------------------------
    zcr = librosa.feature.zero_crossing_rate(y=y, frame_length=n_fft, hop_length=hop)

    # --- Align all features to the same number of frames -------------------------
    feats = [
        _pad_or_truncate(mfcc, n_frames),
        _pad_or_truncate(mfcc_delta, n_frames),
        _pad_or_truncate(mfcc_delta2, n_frames),
        _pad_or_truncate(log_mel, n_frames),
        _pad_or_truncate(chroma, n_frames),
        _pad_or_truncate(contrast, n_frames),
        _pad_or_truncate(rms, n_frames),
        _pad_or_truncate(zcr, n_frames),
    ]

    feature_matrix = np.concatenate(feats, axis=0)   # (FEATURE_DIM, n_frames)
    feature_matrix = feature_matrix.T                # (n_frames, FEATURE_DIM)

    # Per-utterance standardization (zero mean, unit variance) stabilizes
    # training across clips of varying loudness/recording conditions.
    mean = feature_matrix.mean(axis=0, keepdims=True)
    std = feature_matrix.std(axis=0, keepdims=True) + 1e-8
    feature_matrix = (feature_matrix - mean) / std

    return feature_matrix.astype(np.float32)


def extract_features_from_path(path: str, augment: bool = False) -> np.ndarray:
    """Convenience wrapper: load a file from disk -> optional augmentation
    -> full feature matrix. Used by both the tf.data pipeline and predict.py.
    """
    y = load_audio(path)
    if augment:
        y = augment_waveform(y)
    return extract_features(y)