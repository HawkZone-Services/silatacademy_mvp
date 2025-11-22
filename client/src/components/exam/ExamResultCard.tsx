import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExamResultCardProps {
  result: {
    theoryScore: number;
    practicalScore?: number; // مجموع العملي (قد يكون صفر)
    passed?: boolean; // نتيجة النهائي بعد finalize
    completedAt: string; // وقت إنهاء النظري
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
  // FINAL STATUS LOGIC (PATCHED)
  // ============================

  // يعتبر العملي موجوداً حتى لو كانت قيمته = 0
  const hasPractical =
    result.practicalScore !== undefined && result.practicalScore !== null;

  const hasFinalizedResult = typeof result.passed === "boolean";

  let statusLabel = "";
  let statusColor = "";

  if (!hasPractical) {
    // الطالب أنهى النظري فقط
    statusLabel = "Awaiting Practical Evaluation";
    statusColor = "text-yellow-600";
  } else if (hasPractical && !hasFinalizedResult) {
    // المدرب سجل العملي ولم يعمل Finalize
    statusLabel = "Pending Final Review";
    statusColor = "text-blue-600";
  } else {
    // نتيجة نهائية موجودة
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
