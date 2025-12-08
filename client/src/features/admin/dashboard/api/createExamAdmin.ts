import apiClient from "@/shared/api/apiClient";

export const createExamAdmin = (body: any) => {
  return apiClient.post(`/exams/admin`, body);
};
