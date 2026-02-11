import apiClient from "@/shared/api/apiClient";

export const publishExam = (examId: string) =>
  apiClient.patch(`/exams/admin/${examId}/publish`);
