import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExamResultCardProps {
  result: {
    theoryScore: number;
    practicalScore?: number;
    passed?: boolean; // final pass from finalize
    completedAt: string;
    exam?: {
      maxTheoryScore?: number;
    };
  };
  examTitle: string;
}

export function ExamResultCard({ result, examTitle }: ExamResultCardProps) {
  const theory = result.theoryScore ?? 0;
  const practical = result.practicalScore ?? 0;
  const maxTheoryScore = result.exam?.maxTheoryScore ?? 40;

  const theoryPercent =
    maxTheoryScore > 0 ? Math.round((theory / maxTheoryScore) * 100) : 0;

  // ============================
  // STATUS LOGIC (FINAL)
  // ============================
  let statusLabel = "";
  let statusColor = "";

  const hasPractical = practical > 0;
  const hasFinalizedResult = typeof result.passed === "boolean";

  if (!hasPractical) {
    // Student finished theory only
    statusLabel = "Awaiting Practical Evaluation";
    statusColor = "text-yellow-600";
  } else if (hasPractical && !hasFinalizedResult) {
    // Instructor added practical scores but did NOT finalize
    statusLabel = "Pending Final Review";
    statusColor = "text-blue-600";
  } else {
    // Final exam result available
    statusLabel = result.passed ? "Passed" : "Failed";
    statusColor = result.passed ? "text-green-600" : "text-red-600";
  }

  return (
    <Card className="shadow-md border border-border/40">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{examTitle}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* FINAL STATUS */}
        <p className={`font-semibold ${statusColor}`}>{statusLabel}</p>

        {/* THEORY */}
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Theory Score</span>
          <span className="font-semibold">
            {theory} pts ({theoryPercent}%)
          </span>
        </div>

        {/* PRACTICAL */}
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Practical Score</span>
          <span className="font-semibold">{practical} pts</span>
        </div>

        {/* DATE */}
        <div className="flex justify-between text-sm mt-2">
          <span className="text-muted-foreground">Completed:</span>
          <span>{new Date(result.completedAt).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
