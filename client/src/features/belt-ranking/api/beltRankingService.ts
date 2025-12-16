// src/features/belt-ranking/api/beltRankingService.ts

import apiClient from "@/shared/api/apiClient";
import { BeltRanking } from "../types/beltRanking.types";

const beltRankingService = {
  list: () => apiClient.get<BeltRanking[]>("/ranking"),

  create: (body: Partial<BeltRanking>) => apiClient.post("/ranking", body),

  update: (id: string, body: Partial<BeltRanking>) =>
    apiClient.patch(`/ranking/${id}`, body),

  remove: (id: string) => apiClient.delete(`/ranking/${id}`),
};

export default beltRankingService;
