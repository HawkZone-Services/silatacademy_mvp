import apiClient from "@/shared/api/apiClient";

const attendanceService = {
  getPlayerAttendance: (playerId) =>
    apiClient.get(`/attendance/player/${playerId}`),
  addAttendance: (body) => apiClient.post("/attendance", body),
  getCoachSessions: (coachId) => apiClient.get(`/attendance/coach/${coachId}`),
  getStats: () => apiClient.get("/attendance/stats"),
  getMySummary: () => apiClient.get("/attendance/my/summary"),
  getMyAttendance: () => apiClient.get("/attendance/my/logs"),
  getMy: () => apiClient.get("/attendance/my"),
};

export default attendanceService;
