import { QuestionnaireAnswers, QuestionnaireResult } from "../types";
import { handleResponse } from "./api";

export const submitQuestionnaire = async (answers: QuestionnaireAnswers): Promise<QuestionnaireResult> => {
  const response = await fetch("/api/questionnaire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  return handleResponse<QuestionnaireResult>(response);
};
