import apiClient from "@/shared/api/apiClient";

const coachService = {
  listCoaches: () => apiClient.get("/coach"),
  getPendingUpgrades: () => apiClient.get("/coach/belt-upgrades/pending"),
  approveUpgrade: (id, body) =>
    apiClient.patch(`/coach/belt-upgrades/${id}/approve`, body),
  assignTask: (body) => apiClient.post("/coach/tasks", body),
  getPlayerLessons: (playerId) =>
    apiClient.get(`/coach/players/${playerId}/lessons`),
  getPlayerExams: (playerId) =>
    apiClient.get(`/coach/players/${playerId}/exams`),
  getPlayerTasks: (playerId) =>
    apiClient.get(`/coach/players/${playerId}/tasks`),
};

export default coachService;
