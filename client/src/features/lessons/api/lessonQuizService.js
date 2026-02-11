import apiClient from "@/shared/api/apiClient";

const lessonQuizService = {
  getQuiz: (lessonId) => apiClient.get(`/lessons/${lessonId}/quiz`),
  submitQuiz: (lessonId, body) =>
    apiClient.post(`/lessons/${lessonId}/quiz/submit`, body),
};

export default lessonQuizService;
