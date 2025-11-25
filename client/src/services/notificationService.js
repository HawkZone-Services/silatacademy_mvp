import apiClient from "@/lib/apiClient";

const notificationService = {
  getMyNotifications: () => apiClient.get("/notifications/my"),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  getAll: () => apiClient.get("/notifications"),
  markRead: (id) => apiClient.post(`/notifications/${id}/read`),
};

export default notificationService;
