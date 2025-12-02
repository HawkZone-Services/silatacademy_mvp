import apiClient from "@/shared/api/apiClient";

export const getExamById = (examId: string) => apiClient.get(`/exams/${examId}`);
