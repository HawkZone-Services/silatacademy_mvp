import apiClient from "@/shared/api/apiClient";

const lessonService = {
  getLessons: (params = "") =>
    apiClient.get(`/lessons${params ? `?${params}` : ""}`),
  getLesson: (id) => apiClient.get(`/lessons/${id}`),
  getMyLessons: () => apiClient.get("/lessons/student/my"),
  createLesson: (body) => apiClient.post("/lessons", body),
  updateLesson: (id, body) => apiClient.patch(`/lessons/${id}`, body),
  updateLessonQuiz: (id, quiz) => apiClient.patch(`/lessons/${id}`, { quiz }),
  saveProgress: (id, body) => apiClient.post(`/lessons/${id}/progress`, body),
};

export default lessonService;
