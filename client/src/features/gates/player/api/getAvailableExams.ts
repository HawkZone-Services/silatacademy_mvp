import apiClient from "@/shared/api/apiClient";
export const getAvailableExams = (beltLevel) =>
  apiClient.get(beltLevel ? `/exams/belt/${beltLevel}` : `/exams/belt`);
