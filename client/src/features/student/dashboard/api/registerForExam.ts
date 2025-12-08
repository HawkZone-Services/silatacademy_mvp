import apiClient from "@/shared/api/apiClient";

export const registerForExam = (body: any) => {
  return apiClient.post(`/exams/register`, body);
};
