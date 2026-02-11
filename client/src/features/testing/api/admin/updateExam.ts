import apiClient from "@/shared/api/apiClient";

export const updateExam = (examId: string, body: any) =>
  apiClient.patch(`/exams/admin/${examId}`, body);
