import apiClient from "@/shared/api/apiClient";

export const finalizeExam = (body: any) =>
  apiClient.post("/exams/admin/finalize", body);
