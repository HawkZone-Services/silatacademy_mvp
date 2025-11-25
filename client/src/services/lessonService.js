import apiClient from "@/lib/apiClient";

const lessonService = {
  getLessons: (params = "") =>
    apiClient.get(`/lessons${params ? `?${params}` : ""}`),
  getLesson: (id) => apiClient.get(`/lessons/${id}`),
  createLesson: (body) => apiClient.post("/lessons", { body }),
  updateLesson: (id, body) => apiClient.patch(`/lessons/${id}`, { body }),
  saveProgress: (id, body) =>
    apiClient.post(`/lessons/${id}/progress`, { body }),
};

export default lessonService;
