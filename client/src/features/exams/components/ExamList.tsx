import { ExamCard } from "./ExamCard";

type ExamListProps = {
  exams: any[];
  onSelect?: (exam: any) => void;
  actionLabel?: string;
};

export function ExamList({ exams, onSelect, actionLabel }: ExamListProps) {
  if (!exams?.length) {
    return <p className="text-sm text-muted-foreground">No exams available.</p>;
  }

  return (
    <div className="grid gap-3">
      {exams.map((exam) => {
        const locked = exam.locked || exam.isEligible === false;
        const reason = exam.reasonIfNotEligible || exam.lockedReason || null;
        return (
          <ExamCard
            key={exam._id}
            exam={exam}
            onAction={onSelect}
            actionLabel={actionLabel}
            disabled={locked}
            reason={reason}
          />
        );
      })}
    </div>
  );
}
