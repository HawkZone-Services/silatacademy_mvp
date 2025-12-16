import apiClient from "@/shared/api/apiClient";

export const getMyBeltProgress = () =>
  apiClient.get("/player/my/belt-progress");
