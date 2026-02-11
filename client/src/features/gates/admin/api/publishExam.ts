import apiClient from "@/shared/api/apiClient";

export const publishExam = (examId: string) => {
  return apiClient.patch(`/exams/admin/${examId}/publish`);
};
