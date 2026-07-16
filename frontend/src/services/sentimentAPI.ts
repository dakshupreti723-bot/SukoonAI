import { Message, SentimentResult } from "../types";
import { handleResponse } from "./api";
import { API_BASE } from "./api";

export const submitSentimentChat = async (messages: Message[]): Promise<SentimentResult> => {
  
const response = await fetch(`${API_BASE}/api/sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return handleResponse<SentimentResult>(response);
};
