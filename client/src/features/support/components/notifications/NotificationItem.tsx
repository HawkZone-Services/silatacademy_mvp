import { Bell, Award, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

const icons = {
  exam: Bell,
  certificate: GraduationCap,
  belt: Award,
  attendance: Bell,
};

export function NotificationItem({ notification, onRead }) {
  const navigate = useNavigate();
  const Icon = icons[notification.type] || Bell;

  const handleClick = () => {
    if (!notification.read) onRead(notification._id);

    const meta = notification.meta || {};
    if (notification.type === "certificate" && meta.certificateId) {
      navigate(`/certificates/${meta.certificateId}`);
    } else if (notification.type === "belt") {
      navigate("/belt-progress");
    } else if (notification.type === "exam" && meta.examId) {
      navigate(`/exams/${meta.examId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex gap-3 p-3 rounded-md cursor-pointer",
        !notification.isRead && "bg-muted"
      )}
    >
      <Icon className="h-5 w-5 mt-1" />
      <div>
        <p className="font-medium">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
      </div>
    </div>
  );
}
