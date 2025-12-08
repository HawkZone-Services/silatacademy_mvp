import apiClient from "@/shared/api/apiClient";

export const approveRegistration = (regId: string) => {
  return apiClient.patch(`/exams/admin/registration/${regId}/approve`);
};
