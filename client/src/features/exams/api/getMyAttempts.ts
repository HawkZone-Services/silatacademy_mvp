import apiClient from "@/shared/api/apiClient";

export const getMyAttempts = () => apiClient.get("/exams/my-attempts");
