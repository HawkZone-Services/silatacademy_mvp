import apiClient from "@/shared/api/apiClient";

const analyticsService = {
  getStudents: () => apiClient.get("/admin/analytics/students"),
  getBelts: () => apiClient.get("/admin/analytics/belt"),
  getExams: () => apiClient.get("/admin/analytics/exams"),
  getLessons: () => apiClient.get("/admin/analytics/lessons"),
};

export default analyticsService;
