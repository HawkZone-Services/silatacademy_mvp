import apiClient from "@/shared/api/apiClient";

export const getExams = () => apiClient.get("/exams");
