import { FinalReportResult } from "../types";
import { handleResponse } from "./api";
import { API_BASE } from "./api";

export interface FinalSubmission {
  phq9Responses: number[];
  journalText: string;
  voiceBlob: Blob;
}

export const submitFinalConsolidation = async (
  data: FinalSubmission
): Promise<FinalReportResult> => {
  const { phq9Responses, journalText, voiceBlob } = data;

  const formData = new FormData();
  formData.append("phq9_responses", JSON.stringify(phq9Responses));
  formData.append("journal_text", journalText);
  formData.append("voice_audio", voiceBlob, "assessment_voice.wav");

  // Do NOT manually set Content-Type here — the browser needs to
  // generate the multipart boundary itself.
  const response = await fetch(`${API_BASE}/api/final`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<FinalReportResult>(response);
};