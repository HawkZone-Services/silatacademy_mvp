import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubmissionsListProps {
  list?: any[];
  onSelect: (studentId: string, examId: string) => void;
}

export function SubmissionsList({ list = [], onSelect }: SubmissionsListProps) {
  // Filter out finalized
  const filtered = Array.isArray(list)
    ? list.filter((s) => !Boolean(s?.finalPassed))
    : [];

  if (!filtered.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No theory submissions yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((sub) => {
        /** =========================
         *  Normalize Fields
         *  ========================= */

        const student =
          sub?.student && typeof sub.student === "object" ? sub.student : {};

        const studentId =
          student?._id || sub?.studentId || sub?.student || null;

        const examId =
          (typeof sub.exam === "object" && sub.exam?._id) || sub?.exam || null;

        const isFinal = Boolean(sub?.finalPassed);

        /** =========================
         *  Display Name
         *  ========================= */
        const name =
          student?.name ||
          sub?.studentName ||
          (studentId ? `Student ${String(studentId).slice(-4)}` : "Unknown");

        /** =========================
         *  Scores (Theoretical)
         *  ========================= */
        const theoryScore = sub?.theoryScore ?? sub?.autoScore ?? 0;

        /** =========================
         *  Render Item
         *  ========================= */
        return (
          <Card
            key={sub?._id || `${examId}-${studentId}`}
            className="p-4 flex items-center justify-between hover:bg-accent/10 transition"
          >
            {/* LEFT SIDE */}
            <div>
              <p className="font-semibold text-lg">{name}</p>

              {student?.email && (
                <p className="text-sm text-muted-foreground">
                  Email: {student.email}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Submitted:{" "}
                {sub?.submittedAt
                  ? new Date(sub.submittedAt).toLocaleString()
                  : "Pending"}
              </p>

              <p className="text-xs text-muted-foreground">
                Auto Score: <strong>{theoryScore}</strong>
              </p>

              {isFinal && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  Finalized
                </p>
              )}
            </div>

            {/* RIGHT SIDE */}
            <Button
              size="sm"
              variant={isFinal ? "secondary" : "default"}
              disabled={!studentId || !examId || isFinal}
              onClick={() =>
                studentId &&
                examId &&
                onSelect(String(studentId), String(examId))
              }
            >
              {isFinal ? "Finalized" : "Evaluate Practical"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
