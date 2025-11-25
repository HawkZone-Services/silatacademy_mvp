import apiClient from "@/lib/apiClient";

const rankingService = {
  getBelts: () => apiClient.get("/ranking/belts"),
  getRanking: () => apiClient.get("/ranking"),
};

export default rankingService;
