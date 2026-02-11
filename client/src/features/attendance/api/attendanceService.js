// src/features/attendance/api/attendanceService.ts

import apiClient from "@/shared/api/apiClient";

const attendanceService = {
  getMyAttendanceDashboard: () => apiClient.get("/attendance/my"),

  // Admin / Instructor
  getPlayerAttendance: (playerId) =>
    apiClient.get(`/attendance/player/${playerId}`),

  addAttendance: (body) => apiClient.post("/attendance", body),

  getCoachSessions: (coachId) => apiClient.get(`/attendance/coach/${coachId}`),

  getStats: () => apiClient.get("/attendance/stats"),
};

export default attendanceService;
