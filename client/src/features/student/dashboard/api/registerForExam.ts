import apiClient from "@/shared/api/apiClient";

export const registerForExam = async (examId: string) => {
  const res = await apiClient.post("/exams/register", { examId });
  return res?.data;
};
