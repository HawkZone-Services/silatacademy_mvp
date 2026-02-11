import apiClient from "@/shared/api/apiClient";

export const finalizeExam = (body: any) => {
  return apiClient.post(`/exams/admin/finalize`, body);
};
