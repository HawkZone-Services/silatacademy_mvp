import apiClient from "@/shared/api/apiClient";

export const createExam = (body: any) => apiClient.post("/exams/admin", body);
