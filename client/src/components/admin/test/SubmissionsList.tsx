import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubmissionsListProps {
  list?: any[];
  onSelect: (studentId: string, examId: string) => void;
}

export function SubmissionsList({ list, onSelect }: SubmissionsListProps) {
  const filtered = Array.isArray(list)
    ? list.filter((s) => !s?.finalPassed) // hide finalized
    : [];

  if (!filtered || filtered.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No theory submissions yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((sub) => {
        const studentObj = sub?.student || {};
        const studentId =
          studentObj?._id || sub?.studentId || sub?.student || "";
        const examId =
          (sub?.exam && typeof sub.exam === "object" && sub.exam._id) ||
          sub?.exam ||
          "";
        const isFinal = Boolean(sub?.finalPassed);

        const displayName =
          studentObj?.name || sub?.studentName || "Student";

        return (
          <Card
            key={sub?._id || `${examId}-${studentId}`}
            className="p-4 flex items-center justify-between hover:bg-accent/10 transition"
          >
            <div>
              <p className="font-semibold text-lg">{displayName}</p>

              {studentObj?.email && (
                <p className="text-sm text-muted-foreground">
                  Email: {studentObj.email}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Submitted:{" "}
                {sub?.submittedAt
                  ? new Date(sub.submittedAt).toLocaleString()
                  : "Pending"}
              </p>

              <p className="text-xs text-muted-foreground">
                Auto Score: <strong>{sub?.autoScore ?? 0}</strong>
              </p>

              {isFinal && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  Finalized
                </p>
              )}
            </div>

            <Button
              size="sm"
              variant={isFinal ? "secondary" : "default"}
              disabled={!studentId || !examId || isFinal}
              onClick={() => onSelect(String(studentId), String(examId))}
            >
              {isFinal ? "Finalized" : "Evaluate Practical"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
