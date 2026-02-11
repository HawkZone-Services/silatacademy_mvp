import apiClient from "@/shared/api/apiClient";

export const getRegistrationStatus = (examId: string) =>
  apiClient.get(`/exams/registration/status/${examId}`);
