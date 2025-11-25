import apiClient from "@/lib/apiClient";

const attendanceService = {
  getPlayerAttendance: (playerId) =>
    apiClient.get(`/attendance/player/${playerId}`),
  addAttendance: (body) => apiClient.post("/attendance", { body }),
  getCoachSessions: (coachId) =>
    apiClient.get(`/attendance/coach/${coachId}`),
  getStats: () => apiClient.get("/attendance/stats"),
};

export default attendanceService;
