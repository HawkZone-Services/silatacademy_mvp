import apiClient from "@/shared/api/apiClient";
import { StudentExam } from "../types/exam.types";

export const getExams = async () => {
  const res = await apiClient.get("/exams/");
  return (res.data?.exams || []) as StudentExam[];
};
