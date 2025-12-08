import apiClient from "@/shared/api/apiClient";

export const getExam = (id: string) => {
  return apiClient.get(`/exams/${id}`);
};
