import { VoiceResult } from "../types";
import { handleResponse } from "./api";

export const submitVoiceAudio = async (audioBlob: Blob): Promise<VoiceResult> => {
  const formData = new FormData();
  formData.append("voice_audio", audioBlob, "assessment_voice.wav");

  const response = await fetch("/api/voice", {
    method: "POST",
    body: formData,
  });
  return handleResponse<VoiceResult>(response);
};
