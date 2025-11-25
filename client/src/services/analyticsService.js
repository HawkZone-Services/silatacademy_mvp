import apiClient from "@/lib/apiClient";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

const analyticsService = {
  getStudents: () => apiClient.get(`${API}/analytics/students`),
  getBelts: () => apiClient.get(`${API}/analytics/belt`),
  getExams: () => apiClient.get(`${API}/analytics/exams`),
  getLessons: () => apiClient.get(`${API}/analytics/lessons`),
};

export default analyticsService;
