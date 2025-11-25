import apiClient from "@/lib/apiClient";

const attendanceService = {
  getMyAttendance: () => apiClient.get("/attendance/my"),
  getPlayerAttendance: (playerId) =>
    apiClient.get(`/attendance/player/${playerId}`),
};

export default attendanceService;
