// Client-side audio -> 16-bit PCM WAV conversion.
//
// Browsers' MediaRecorder produces WebM/Opus (or OGG), which the Python
// backend cannot decode without ffmpeg. We decode the recording with the
// Web Audio API and re-encode it as a real mono 16-bit PCM WAV so librosa
// (soundfile backend) reads it directly. Keeps the whole pipeline ffmpeg-free.

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  const dataSize = samples.length * 2;
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, 1, true); // channels = mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Float [-1,1] -> 16-bit PCM
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

/** Decode an arbitrary recorded audio Blob and re-encode it as mono WAV. */
export async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // Downmix all channels to mono.
    const length = audioBuffer.length;
    const mono = new Float32Array(length);
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      for (let i = 0; i < length; i++) mono[i] += data[i];
    }
    if (audioBuffer.numberOfChannels > 1) {
      for (let i = 0; i < length; i++) mono[i] /= audioBuffer.numberOfChannels;
    }

    return encodeWav(mono, audioBuffer.sampleRate);
  } finally {
    ctx.close();
  }
}

/** A valid short silent WAV, used as a safe fallback when mic capture fails. */
export function makeSilentWav(seconds = 3, sampleRate = 16000): Blob {
  return encodeWav(new Float32Array(Math.floor(seconds * sampleRate)), sampleRate);
}
