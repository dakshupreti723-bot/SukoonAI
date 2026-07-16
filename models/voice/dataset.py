"""
dataset.py
==========
RAVDESS dataset handling for Sukoon AI's voice emotion model:

  1. Extracts ravdess.zip (if not already extracted).
  2. Walks the extracted tree and builds a (filepath, emotion_label) index
     by parsing the RAVDESS filename convention.
  3. Splits into stratified train / validation / test sets.
  4. Wraps everything in a tf.data.Dataset pipeline that calls into
     feature_extractor.py (via tf.py_function) to turn raw audio files
     into fixed-size feature tensors, with on-the-fly augmentation for
     the training split only.
"""

import os
import glob
import logging
import zipfile
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

import config
import feature_extractor
from utils import ensure_dirs

logger = logging.getLogger("sukoon_voice")


# --------------------------------------------------------------------------
# Zip extraction
# --------------------------------------------------------------------------
def extract_ravdess_zip(zip_path: str = config.ZIP_PATH,
                         extract_dir: str = config.RAVDESS_EXTRACT_DIR) -> str:
    """Extract ravdess.zip into extract_dir if not already done."""
    ensure_dirs()

    already_extracted = os.path.isdir(extract_dir) and len(
        glob.glob(os.path.join(extract_dir, "**", "*.wav"), recursive=True)
    ) > 0

    if already_extracted:
        logger.info(f"RAVDESS already extracted at {extract_dir}, skipping unzip.")
        return extract_dir

    if not os.path.isfile(zip_path):
        raise FileNotFoundError(
            f"Could not find {zip_path}. Please place ravdess.zip inside "
            f"models/model2_voice/ before running training."
        )

    logger.info(f"Extracting {zip_path} -> {extract_dir} ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)
    logger.info("Extraction complete.")
    return extract_dir


# --------------------------------------------------------------------------
# Index building
# --------------------------------------------------------------------------
def _parse_emotion_from_filename(filename: str) -> str:
    """
    RAVDESS naming convention:
    modality-vocalChannel-emotion-intensity-statement-repetition-actor.wav
    e.g. 03-01-05-01-01-01-12.wav -> emotion code '05' -> 'angry'
    """
    stem = os.path.splitext(os.path.basename(filename))[0]
    parts = stem.split("-")
    if len(parts) < 3:
        return None
    emotion_code = parts[2]
    return config.RAVDESS_EMOTION_MAP.get(emotion_code)


def build_file_index(root_dir: str = config.RAVDESS_EXTRACT_DIR) -> pd.DataFrame:
    """Recursively scan root_dir for .wav files and build a labeled index."""
    wav_paths = glob.glob(os.path.join(root_dir, "**", "*.wav"), recursive=True)
    if not wav_paths:
        raise RuntimeError(
            f"No .wav files found under {root_dir}. Check that ravdess.zip "
            f"extracted correctly."
        )

    records = []
    for path in wav_paths:
        emotion = _parse_emotion_from_filename(path)
        if emotion is None:
            logger.warning(f"Skipping file with unrecognized naming pattern: {path}")
            continue
        records.append({"filepath": path, "emotion": emotion})

    df = pd.DataFrame.from_records(records)
    logger.info(f"Indexed {len(df)} audio files across {df['emotion'].nunique()} emotion classes.")
    logger.info("Class distribution:\n" + df["emotion"].value_counts().to_string())
    return df


# --------------------------------------------------------------------------
# Splitting
# --------------------------------------------------------------------------
@dataclass
class DataSplits:
    train_paths: List[str]
    train_labels: np.ndarray
    val_paths: List[str]
    val_labels: np.ndarray
    test_paths: List[str]
    test_labels: np.ndarray
    label_encoder: LabelEncoder


def build_splits(df: pd.DataFrame,
                  test_size: float = config.TEST_SIZE,
                  val_size: float = config.VAL_SIZE,
                  seed: int = config.RANDOM_SEED) -> DataSplits:
    """Stratified train/val/test split, encoded with a fitted LabelEncoder."""
    label_encoder = LabelEncoder()
    label_encoder.fit(config.EMOTION_LABELS)

    y_all = label_encoder.transform(df["emotion"].values)
    x_all = df["filepath"].values

    x_trainval, x_test, y_trainval, y_test = train_test_split(
        x_all, y_all, test_size=test_size, random_state=seed, stratify=y_all
    )
    x_train, x_val, y_train, y_val = train_test_split(
        x_trainval, y_trainval, test_size=val_size, random_state=seed, stratify=y_trainval
    )

    logger.info(
        f"Split sizes -> train: {len(x_train)}, val: {len(x_val)}, test: {len(x_test)}"
    )

    return DataSplits(
        train_paths=list(x_train),
        train_labels=y_train,
        val_paths=list(x_val),
        val_labels=y_val,
        test_paths=list(x_test),
        test_labels=y_test,
        label_encoder=label_encoder,
    )


# --------------------------------------------------------------------------
# tf.data pipeline
# --------------------------------------------------------------------------
def _extract_features_py(filepath_tensor, label_tensor, augment: bool):
    filepath = filepath_tensor.numpy().decode("utf-8")
    features = feature_extractor.extract_features_from_path(filepath, augment=augment)
    return features.astype(np.float32), np.int32(label_tensor.numpy())


def _make_tf_map_fn(augment: bool):
    def _map_fn(filepath, label):
        features, label_out = tf.py_function(
            func=lambda fp, lb: _extract_features_py(fp, lb, augment),
            inp=[filepath, label],
            Tout=[tf.float32, tf.int32],
        )
        features.set_shape(config.INPUT_SHAPE)
        label_out.set_shape([])
        label_one_hot = tf.one_hot(label_out, depth=config.NUM_CLASSES)
        return features, label_one_hot
    return _map_fn


def build_tf_dataset(paths: List[str], labels: np.ndarray,
                      batch_size: int = config.BATCH_SIZE,
                      shuffle: bool = False,
                      augment: bool = False) -> tf.data.Dataset:
    """Turn a list of filepaths + integer labels into a batched tf.data pipeline."""
    paths_tensor = tf.constant(paths)
    labels_tensor = tf.constant(labels, dtype=tf.int32)

    ds = tf.data.Dataset.from_tensor_slices((paths_tensor, labels_tensor))

    if shuffle:
        ds = ds.shuffle(buffer_size=min(config.SHUFFLE_BUFFER, len(paths)), seed=config.RANDOM_SEED)

    ds = ds.map(_make_tf_map_fn(augment=augment), num_parallel_calls=config.NUM_PARALLEL_CALLS)
    ds = ds.batch(batch_size)
    ds = ds.prefetch(tf.data.AUTOTUNE)
    return ds


def get_datasets() -> Tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, DataSplits]:
    """
    Full pipeline entry point: extract zip -> build index -> split ->
    return (train_ds, val_ds, test_ds, splits).
    """
    extract_ravdess_zip()
    df = build_file_index()
    splits = build_splits(df)

    train_ds = build_tf_dataset(
        splits.train_paths, splits.train_labels, shuffle=True, augment=True
    )
    val_ds = build_tf_dataset(
        splits.val_paths, splits.val_labels, shuffle=False, augment=False
    )
    test_ds = build_tf_dataset(
        splits.test_paths, splits.test_labels, shuffle=False, augment=False
    )

    return train_ds, val_ds, test_ds, splits