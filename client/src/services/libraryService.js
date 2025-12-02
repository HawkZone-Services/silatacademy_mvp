import apiClient from "@/shared/api/apiClient";

const libraryService = {
  list: (query = "") =>
    apiClient.get(`/library${query ? `?${query}` : ""}`),
  getById: (id) => apiClient.get(`/library/${id}`),
  create: (body) => apiClient.post("/library", body),
  update: (id, body) => apiClient.patch(`/library/${id}`, body),
  remove: (id) => apiClient.delete(`/library/${id}`),
};

export default libraryService;
