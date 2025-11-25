import apiClient from "@/lib/apiClient";

const adminService = {
  getDashboard: () => apiClient.get("/admin/dashboard"),
  getPlayers: () => apiClient.get("/admin/players"),
  getPlayerById: (id) => apiClient.get(`/admin/players/${id}`),
  createPlayer: (body) => apiClient.post("/admin/players", { body }),
  updatePlayer: (id, body) => apiClient.put(`/admin/players/${id}`, { body }),
  deletePlayer: (id) => apiClient.delete(`/admin/players/${id}`),
  getLessons: () => apiClient.get("/lessons"),
  getAttendanceToday: () => apiClient.get("/attendance/stats"),
  getReportsExport: () => apiClient.get("/admin/reports/export"),
};

export default adminService;
