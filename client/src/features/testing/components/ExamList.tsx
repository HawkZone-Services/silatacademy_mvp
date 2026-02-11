import { StudentExam } from "../types/exam.types";
import { ExamCard } from "./ExamCard";

export function ExamList({ exams }: { exams: StudentExam[] }) {
  if (!exams.length)
    return (
      <p className="text-muted-foreground text-sm">No exams available yet.</p>
    );

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <ExamCard key={exam._id} exam={exam} />
      ))}
    </div>
  );
}
