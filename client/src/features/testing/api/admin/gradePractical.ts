import apiClient from "@/shared/api/apiClient";

export const gradePractical = (body: any) =>
  apiClient.post("/exams/admin/practical/score", body);
