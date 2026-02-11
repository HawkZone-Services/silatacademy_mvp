type AttemptSummaryProps = {
  attempt: any;
};

export function AttemptSummary({ attempt }: AttemptSummaryProps) {
  if (!attempt) return null;
  const exam = attempt.exam || {};
  return (
    <div className="border rounded-lg p-3 bg-accent/10 space-y-1 text-sm">
      <div className="font-semibold">{exam.title}</div>
      <div>Theory: {attempt.theoryScore ?? 0} / {exam.maxTheoryScore ?? "-"}</div>
      <div>Status: {attempt.finalPassed ? "Passed" : attempt.submittedAt ? "Pending" : "In progress"}</div>
      <div>Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "—"}</div>
    </div>
  );
}
