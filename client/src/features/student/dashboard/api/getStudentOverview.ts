import apiClient from "@/shared/api/apiClient";
export const getMe = () => apiClient.get("/player/me");
