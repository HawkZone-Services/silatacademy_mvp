import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubmissionsListProps {
  list: any[];
  onSelect: (studentId: string, examId: string) => void;
}

export function SubmissionsList({ list, onSelect }: SubmissionsListProps) {
  if (!list || list.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No theory submissions yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((sub) => {
        const studentObj = sub.student || {};
        const studentId = studentObj?._id || "";
        const examId = typeof sub.exam === "object" ? sub.exam._id : sub.exam;

        const displayName = studentObj?.name || "Unnamed Student";

        return (
          <Card
            key={sub._id}
            className="p-4 flex items-center justify-between hover:bg-accent/10 transition"
          >
            <div>
              <p className="font-semibold text-lg">{displayName}</p>

              <p className="text-sm text-muted-foreground">
                Email: {studentObj?.email || "N/A"}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Submitted:{" "}
                {sub.submittedAt
                  ? new Date(sub.submittedAt).toLocaleString()
                  : "Pending"}
              </p>

              <p className="text-xs text-muted-foreground">
                Auto Score: <strong>{sub.autoScore || 0}</strong>
              </p>
            </div>

            <Button
              size="sm"
              disabled={!studentId || !examId}
              onClick={() => onSelect(String(studentId), String(examId))}
            >
              Evaluate Practical
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
