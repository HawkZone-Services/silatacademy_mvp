import apiClient from "@/lib/apiClient";

const examService = {
  getAvailable: () => apiClient.get("/exams/available"),
  getResults: () => apiClient.get("/exams/results"),
  startAttempt: (examId) =>
    apiClient.post("/exams/attempt/start", { body: { examId } }),
  submitAttempt: (attemptId, answers) =>
    apiClient.post("/exams/attempt/submit", {
      body: { attemptId, answers },
    }),
  getAttempt: (attemptId) => apiClient.get(`/exams/attempt/${attemptId}`),
};

export default examService;
