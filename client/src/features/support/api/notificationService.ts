import apiClient from "@/shared/api/apiClient";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type:
    | "exam"
    | "result"
    | "system"
    | "event"
    | "lesson"
    | "certificate"
    | "belt";
  isRead: boolean;
  createdAt: string;
  link?: string;
  meta?: Record<string, any>;
}

const notificationService = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const res = await apiClient.get("/notifications");
    return res.data.notifications;
  },

  create: (body: Partial<Notification>) =>
    apiClient.post("/notifications", body),

  markRead: (id: string) => apiClient.post(`/notifications/${id}/read`),
};

export const { getMyNotifications, create, markRead } = notificationService;

export default notificationService;
