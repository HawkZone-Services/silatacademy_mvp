import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyNotifications, markRead } from "@/features/support/api/notificationService";
import { NotificationItem } from "./NotificationItem";

export function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
  });

  const { mutate: markAsRead } = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!notifications.length) {
    return (
      <p className="p-4 text-sm text-muted-foreground">No notifications yet</p>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {notifications.map((n) => (
        <NotificationItem key={n._id} notification={n} onRead={markAsRead} />
      ))}
    </div>
  );
}
