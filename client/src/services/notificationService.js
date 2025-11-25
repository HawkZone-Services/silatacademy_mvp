import apiClient from "@/lib/apiClient";

const notificationService = {
  getAll: () => apiClient.get("/notifications"),
  create: (body) => apiClient.post("/notifications", { body }),
  markRead: (id) => apiClient.post(`/notifications/${id}/read`),
};

export default notificationService;
