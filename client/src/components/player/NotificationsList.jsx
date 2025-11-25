import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import notificationService from "@/services/notificationService";

export default function NotificationsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setItems(data.notifications);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  if (loading) return <p className="text-muted-foreground">Loading notifications...</p>;

  if (!items.length) return <p className="text-muted-foreground">No notifications.</p>;

  return (
    <Card className="p-4 space-y-3">
      {items.map((n) => (
        <div
          key={n._id}
          className="flex items-start justify-between border-b last:border-none pb-2"
        >
          <div>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
          {!n.isRead && (
            <Button size="sm" variant="outline" onClick={() => markRead(n._id)}>
              Mark read
            </Button>
          )}
        </div>
      ))}
    </Card>
  );
}
