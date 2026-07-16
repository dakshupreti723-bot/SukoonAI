"""
model.py
========
CNN + BiLSTM + Attention architecture for speech emotion recognition.

Pipeline:
    Input (FIXED_FRAMES, FEATURE_DIM)
      -> stacked Conv1D blocks (feature/local pattern extraction over time)
      -> stacked Bidirectional LSTM (temporal context modeling)
      -> custom additive (Bahdanau-style) attention pooling
      -> Dense classification head -> softmax over NUM_CLASSES
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

from . import config


class AttentionLayer(layers.Layer):
    """
    Additive (Bahdanau-style) self-attention pooling layer.

    Given a sequence of hidden states H of shape (batch, T, features), this
    layer learns a scalar importance score per time step, normalizes those
    scores with softmax, and returns the weighted sum of H over time -
    i.e. a single context vector of shape (batch, features) that focuses
    on the most emotionally salient frames of the utterance.
    """

    def __init__(self, units: int = config.ATTENTION_UNITS, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = layers.Dense(units, activation="tanh", name="attn_score_dense")
        self.V = layers.Dense(1, name="attn_score_out")

    def call(self, inputs, mask=None):
        # inputs: (batch, T, features)
        score = self.V(self.W(inputs))                      # (batch, T, 1)
        attention_weights = tf.nn.softmax(score, axis=1)      # (batch, T, 1)
        context_vector = attention_weights * inputs           # (batch, T, features)
        context_vector = tf.reduce_sum(context_vector, axis=1)  # (batch, features)
        return context_vector, tf.squeeze(attention_weights, axis=-1)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units})
        return cfg


def _conv_block(x, filters: int, kernel_size: int, dropout: float, block_id: int):
    x = layers.Conv1D(
        filters, kernel_size, padding="same",
        kernel_regularizer=keras.regularizers.l2(1e-5),
        name=f"conv1d_{block_id}",
    )(x)
    x = layers.BatchNormalization(name=f"bn_{block_id}")(x)
    x = layers.Activation("relu", name=f"relu_{block_id}")(x)
    x = layers.MaxPooling1D(pool_size=2, padding="same", name=f"maxpool_{block_id}")(x)
    x = layers.Dropout(dropout, name=f"dropout_conv_{block_id}")(x)
    return x


def build_model(input_shape=config.INPUT_SHAPE,
                num_classes: int = config.NUM_CLASSES) -> keras.Model:
    """Build and return the compiled-ready (uncompiled) Keras model."""

    inputs = keras.Input(shape=input_shape, name="acoustic_features")

    x = inputs
    for i, filters in enumerate(config.CONV_FILTERS):
        x = _conv_block(x, filters, config.CONV_KERNEL_SIZE, config.CONV_DROPOUT, block_id=i + 1)

    # Stacked Bidirectional LSTM layers
    for i, units in enumerate(config.LSTM_UNITS):
        return_sequences = True  # we always need the full sequence for attention
        x = layers.Bidirectional(
            layers.LSTM(
                units,
                return_sequences=return_sequences,
                dropout=config.LSTM_DROPOUT,
                recurrent_dropout=0.0,
                kernel_regularizer=keras.regularizers.l2(1e-5),
            ),
            name=f"bilstm_{i + 1}",
        )(x)
        x = layers.LayerNormalization(name=f"ln_lstm_{i + 1}")(x)

    # Attention pooling over the time dimension
    context_vector, attention_weights = AttentionLayer(
        units=config.ATTENTION_UNITS, name="attention_pooling"
    )(x)

    # Classification head
    x = layers.Dense(
        config.DENSE_UNITS, activation="relu",
        kernel_regularizer=keras.regularizers.l2(1e-4),
        name="dense_head",
    )(context_vector)
    x = layers.BatchNormalization(name="bn_head")(x)
    x = layers.Dropout(config.DENSE_DROPOUT, name="dropout_head")(x)

    outputs = layers.Dense(num_classes, activation="softmax", name="emotion_output")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="sukoon_voice_emotion_cnn_bilstm_attention")
    return model


def compile_model(model: keras.Model, learning_rate: float = config.LEARNING_RATE) -> keras.Model:
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    loss = keras.losses.CategoricalCrossentropy(label_smoothing=config.LABEL_SMOOTHING)
    model.compile(
        optimizer=optimizer,
        loss=loss,
        metrics=[
            keras.metrics.CategoricalAccuracy(name="accuracy"),
            keras.metrics.AUC(name="auc", multi_label=True),
            keras.metrics.Precision(name="precision"),
            keras.metrics.Recall(name="recall"),
        ],
    )
    return model


if __name__ == "__main__":
    # Quick sanity check: build & print model summary.
    m = build_model()
    m = compile_model(m)
    m.summary()