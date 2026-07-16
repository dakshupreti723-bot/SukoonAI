import { Message, SentimentResult } from "../types";
import { handleResponse } from "./api";

export const submitSentimentChat = async (messages: Message[]): Promise<SentimentResult> => {
  const response = await fetch("/api/sentiment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return handleResponse<SentimentResult>(response);
};
