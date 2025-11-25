import apiClient from "@/lib/apiClient";

const playerService = {
  getMe: () => apiClient.get("/player/me"),
  list: () => apiClient.get("/player"),
  getAllPlayers: () => apiClient.get("/player"),
  getPlayer: (id) => apiClient.get(`/player/${id}`),
  updatePlayer: (id, body) => apiClient.patch(`/player/${id}`, { body }),
  deletePlayer: (id) => apiClient.delete(`/player/${id}`),
  getAttendance: (playerId) =>
    apiClient.get(`/player/${playerId}/attendance`),
  addAttendance: (playerId, body) =>
    apiClient.post(`/player/${playerId}/attendance`, { body }),
};

export default playerService;
