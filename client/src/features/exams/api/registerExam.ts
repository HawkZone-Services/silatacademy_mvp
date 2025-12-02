import apiClient from "@/shared/api/apiClient";

export const registerExam = (examId: string) =>
  apiClient.post("/exams/register", { examId });
