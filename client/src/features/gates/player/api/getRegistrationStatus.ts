import apiClient from "@/shared/api/apiClient";

export const getRegistrationStatus = (examId: string) => {
  return apiClient.get(`/exams/registration/status/${examId}`);
};
