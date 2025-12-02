type ResultCardProps = {
  result: any;
};

export function ResultCard({ result }: ResultCardProps) {
  if (!result) return null;
  const exam = result.exam || {};
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="font-semibold text-lg">{exam.title}</div>
      <div className="text-sm">Theory: {result.theoryScore ?? 0}</div>
      <div className="text-sm">Final: {result.finalTotalScore ?? "-"}</div>
      <div className="text-sm">
        Status: {result.finalPassed ? "Passed" : result.submittedAt ? "Pending" : "In progress"}
      </div>
    </div>
  );
}
