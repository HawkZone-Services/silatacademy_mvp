import apiClient from "@/shared/api/apiClient";

export const getAdminRegistrations = (examId: string) => {
  return apiClient.get(`/exams/admin/registrations/${examId}`);
};
