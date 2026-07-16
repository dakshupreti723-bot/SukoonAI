# Sukoon AI — model2_voice

Voice emotion recognition module for **Sukoon AI**, trained on the RAVDESS
Speech (and Song) Emotion dataset.

## Architecture

```
Acoustic Features (FIXED_FRAMES x FEATURE_DIM)
        |
   Conv1D x3 (BatchNorm + ReLU + MaxPool + Dropout)
        |
   Bidirectional LSTM x2 (LayerNorm)
        |
   Additive Attention Pooling
        |
   Dense (ReLU + BatchNorm + Dropout)
        |
   Softmax (8 emotion classes)
```

## Features extracted per clip

Each 3-second audio clip (resampled to 22050 Hz) is converted into a
`(FIXED_FRAMES, FEATURE_DIM)` matrix, built by stacking the following
frame-aligned features along the feature axis:

| Feature                | Dimensions |
|-------------------------|-----------:|
| MFCC                    | 40 |
| Delta MFCC              | 40 |
| Delta-Delta MFCC        | 40 |
| Log-Mel Spectrogram     | 40 |
| Chroma STFT             | 12 |
| Spectral Contrast       | 7  |
| RMS Energy              | 1  |
| Zero Crossing Rate      | 1  |
| **Total**               | **181** |

Features are standardized (zero mean / unit variance) per utterance.

## Emotion classes

`neutral, calm, happy, sad, angry, fearful, disgust, surprised`

## Setup

```bash
cd models/model2_voice
pip install -r requirements.txt
```

Place the RAVDESS dataset archive at:

```
models/model2_voice/ravdess.zip
```

## Training

```bash
python train.py
```

This will:
1. Extract `ravdess.zip` into `data/ravdess_raw/` (skipped if already extracted).
2. Parse RAVDESS filenames to recover emotion labels.
3. Build a stratified train (≈72%) / validation (≈13%) / test (15%) split.
4. Build a `tf.data` pipeline with on-the-fly waveform augmentation
   (noise, pitch shift, time stretch, time shift, gain scaling) applied
   only to the training split.
5. Train the CNN + BiLSTM + Attention model with:
   - `EarlyStopping` (patience configurable in `config.py`)
   - `ReduceLROnPlateau`
   - `ModelCheckpoint` (best val_loss checkpoint)
   - `CSVLogger`
6. Evaluate on the held-out test set and generate:
   - `artifacts/plots/training_history.png`
   - `artifacts/plots/confusion_matrix.png`
   - `artifacts/logs/classification_report.txt`
7. Save the final artifacts:
   - `artifacts/model/voice_emotion_model.keras`
   - `artifacts/model/label_encoder.pkl`

## Inference

```bash
python predict.py --audio /path/to/clip.wav
```

Outputs a JSON payload with the predicted emotion, confidence, and the
full probability distribution across all classes.

## File overview

| File                    | Purpose |
|--------------------------|---------|
| `config.py`              | Central configuration: paths, audio params, hyperparameters |
| `feature_extractor.py`   | Audio loading, augmentation, multi-feature extraction |
| `dataset.py`             | Zip extraction, file indexing, splitting, `tf.data` pipeline |
| `model.py`                | CNN + BiLSTM + Attention model definition |
| `train.py`                | Full training / evaluation orchestration |
| `predict.py`              | CLI single-file inference |
| `utils.py`                | Seeding, plotting, pickle I/O helpers |
| `requirements.txt`        | Python dependencies |

## Notes

- `FIXED_FRAMES` and `FEATURE_DIM` are derived automatically in
  `config.py` from the audio duration, sample rate, and hop length — no
  manual recalculation needed if you change those parameters.
- The custom `AttentionLayer` in `model.py` must be passed via
  `custom_objects` when loading the saved model outside of `predict.py`
  (already handled there).
- RAVDESS contains both speech and song archives; `dataset.py` indexes
  every `.wav` it finds recursively, regardless of which sub-archives you
  included in `ravdess.zip`.