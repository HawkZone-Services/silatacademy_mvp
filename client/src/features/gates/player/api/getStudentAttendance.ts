import apiClient from "@/shared/api/apiClient";
export const getMySummary = () => apiClient.get("/attendance/my/summary");
