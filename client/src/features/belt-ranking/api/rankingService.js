import apiClient from "@/shared/api/apiClient";

const rankingService = {
  getRanking: () => apiClient.get("/ranking"),
  createRank: (body) => apiClient.post("/ranking", body),
  getEligibleByBelt: (belt) => apiClient.get(`/ranking/${belt}/eligible`),
};

export default rankingService;
