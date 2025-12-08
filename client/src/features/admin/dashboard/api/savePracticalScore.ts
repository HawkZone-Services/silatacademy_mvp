import apiClient from "@/shared/api/apiClient";

export const savePracticalScore = (body: any) => {
  return apiClient.post(`/exams/admin/practical/score`, body);
};
