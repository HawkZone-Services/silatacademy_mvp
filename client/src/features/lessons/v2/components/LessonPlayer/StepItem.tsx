import { StepStatus } from "./stepStatus";

type Props = {
  label: string;
  status: StepStatus;
  onClick?: () => void;
};

export function StepItem({ label, status, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        cursor: status === "active" ? "pointer" : "not-allowed",
        background:
          status === "completed"
            ? "#d1fae5"
            : status === "active"
            ? "#e0f2fe"
            : "#f3f4f6",
        opacity: status === "locked" ? 0.6 : 1,
      }}
    >
      {label}
    </div>
  );
}
