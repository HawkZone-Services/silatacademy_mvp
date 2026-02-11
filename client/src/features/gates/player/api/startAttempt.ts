import apiClient from "@/shared/api/apiClient";

export const startAttempt = (examIdOrBody: string | object) => {
  const payload =
    typeof examIdOrBody === "string" ? { examId: examIdOrBody } : examIdOrBody;

  return apiClient.post(`/exams/attempt/start`, payload);
};
