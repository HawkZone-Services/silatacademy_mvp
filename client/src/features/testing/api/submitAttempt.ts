import apiClient from "@/shared/api/apiClient";

type SubmitPayload = {
  attemptId: string;
  answers: any[];
  focusLosses?: number;
  forcedSubmitReason?: string | null;
};

export const submitAttempt = (payload: SubmitPayload) =>
  apiClient.post("/exams/attempt/submit", payload);
