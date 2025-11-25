import apiClient from "@/lib/apiClient";

const lessonService = {
  getByBelt: () => apiClient.get("/lessons/by-belt"),
  getProgress: () => apiClient.get("/lessons/progress"),
  markCompleted: (lessonId) =>
    apiClient.post("/lessons/complete", { body: { lessonId } }),
  submitQuiz: (lessonId, answers) =>
    apiClient.post("/lessons/quiz", { body: { lessonId, answers } }),
};

export default lessonService;
