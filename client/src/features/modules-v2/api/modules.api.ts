import apiClient from "@/shared/api/apiClient";

export const ModulesV2API = {
  list() {
    return apiClient.get("/modules");
  },

  getById(id: string) {
    return apiClient.get(`/modules/${id}`);
  },

  create(payload: any) {
    return apiClient.post("/modules", payload);
  },

  update(id: string, payload: any) {
    return apiClient.patch(`/modules/${id}`, payload);
  },

  activate(id: string) {
    return apiClient.post(`/modules/${id}/activate`);
  },

  archive(id: string) {
    return apiClient.post(`/modules/${id}/archive`);
  },
};
