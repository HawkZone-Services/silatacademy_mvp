import apiClient from "@/shared/api/apiClient";

export const getMyCertificates = () => {
  return apiClient.get("/certificates/my");
};
