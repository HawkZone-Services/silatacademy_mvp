import apiClient from "@/shared/api/apiClient";

export const rejectRegistration = (regId: string) => {
  return apiClient.patch(`/exams/admin/registration/${regId}/reject`);
};
