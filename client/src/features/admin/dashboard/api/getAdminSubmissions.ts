import apiClient from "@/shared/api/apiClient";

export const getAdminSubmissions = (examId: string) => {
  return apiClient.get(`/exams/admin/submissions/${examId}`);
};
