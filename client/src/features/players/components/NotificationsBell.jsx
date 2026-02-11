import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import notificationService from "@/features/support/api/notificationService";

export default function NotificationsBell({ onClick }) {
  const [unread, setUnread] = useState(0);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        const count = data.notifications.filter((n) => !n.isRead).length;
        setUnread(count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-accent/50"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full px-1">
          {unread}
        </span>
      )}
    </button>
  );
}
