import apiClient from "@/shared/api/apiClient";

export const myCertificates = () => {
  return apiClient.get("/certificates/my");
};
