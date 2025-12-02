import apiClient from "@/shared/api/apiClient";

export const startAttempt = (examId: string) =>
  apiClient.post("/exams/attempt/start", { examId });
