import apiClient from "@/shared/api/apiClient";

export const getMyAttempts = () => apiClient.get("/exams/attempts/me");
