import apiClient from "@/shared/api/apiClient";

export const updateExam = (examId: string, body: any) => {
  return apiClient.patch(`/exams/admin/${examId}`, body);
};
