import apiClient from "@/shared/api/apiClient";

export const getAllExams = () => {
  return apiClient.get(`/exams`);
};
