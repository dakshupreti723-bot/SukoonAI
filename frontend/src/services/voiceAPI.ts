import { VoiceResult } from "../types";
import { handleResponse } from "./api";
import { API_BASE } from "./api";

export const submitVoiceAudio = async (audioBlob: Blob): Promise<VoiceResult> => {
  const formData = new FormData();
  formData.append("voice_audio", audioBlob, "assessment_voice.wav");

  const response = await fetch(`${API_BASE}/api/voice`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<VoiceResult>(response);
};
