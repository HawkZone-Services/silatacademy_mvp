import apiClient from "@/shared/api/apiClient";

export const submitAttempt = (body: any) => {
  return apiClient.post(`/exams/attempt/submit`, body);
};
