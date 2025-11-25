import apiClient from "@/lib/apiClient";

const playerService = {
  getProfile: () => apiClient.get("/player/me"),
  updateProfile: (body) => apiClient.put("/player/update", { body }),
  getAttendance: () => apiClient.get("/attendance/my"),
  getAllPlayers: () => apiClient.get("https://api-f3rwhuz64a-uc.a.run.app/api/player/"),
};

export default playerService;
