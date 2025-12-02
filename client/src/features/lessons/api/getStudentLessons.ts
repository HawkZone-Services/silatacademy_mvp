import apiClient from "@/shared/api/apiClient";

export const getStudentLessons = () => apiClient.get("/lessons/student/available");
