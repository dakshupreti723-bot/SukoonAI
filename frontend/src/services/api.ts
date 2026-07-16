import { 
  QuestionnaireAnswers, 
  QuestionnaireResult, 
  Message, 
  SentimentResult, 
  VoiceResult, 
  FinalReportResult 
} from "../types";

export const API_BASE = "http://localhost:8000";

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
};
