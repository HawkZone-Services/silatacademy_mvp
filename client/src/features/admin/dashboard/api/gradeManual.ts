import apiClient from "@/shared/api/apiClient";

export const gradeManual = (attemptId: string, body: any) => {
  return apiClient.post(`/exams/admin/${attemptId}/grade`, body);
};
