import apiClient from "@/lib/apiClient";

const adminService = {
  getAllExams: () => apiClient.get("/admin/exams/all"),
  createExam: (body) => apiClient.post("/admin/exams/create", { body }),
  getPrograms: () => apiClient.get("/programs"),
  createProgram: (body) => apiClient.post("/admin/programs/create", { body }),
  createPlayer: (body) =>
    apiClient.post(
      "https://api-f3rwhuz64a-uc.a.run.app/api/admin/players",
      { body }
    ),
  getDashboard: () =>
    apiClient.get("https://api-f3rwhuz64a-uc.a.run.app/v1/api/admin/dashboard"),
  getPlayers: () =>
    apiClient.get("https://api-f3rwhuz64a-uc.a.run.app/v1/api/admin/players"),
  getLessons: () =>
    apiClient.get("https://api-f3rwhuz64a-uc.a.run.app/v1/api/admin/lessons"),
  getAttendanceToday: () =>
    apiClient.get(
      "https://api-f3rwhuz64a-uc.a.run.app/v1/api/admin/attendance/today"
    ),
  getPlayerById: (id) =>
    apiClient.get(
      `https://api-f3rwhuz64a-uc.a.run.app/api/admin/players/${id}`
    ),
};

export default adminService;
