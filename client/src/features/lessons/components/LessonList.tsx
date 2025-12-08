// src/features/lessons/components/LessonList.tsx
import { LessonWithEligibility } from "../types/lesson.types";
import { LessonCard } from "./LessonCard";

type LessonListProps = {
  lessons: LessonWithEligibility[];
  onSelect?: (lesson: LessonWithEligibility) => void;
};

export function LessonList({ lessons, onSelect }: LessonListProps) {
  if (!lessons?.length) {
    return (
      <p className="text-sm text-muted-foreground">No lessons available.</p>
    );
  }

  return (
    <div className="grid gap-3">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson._id}
          lesson={lesson}
          onClick={() => onSelect?.(lesson)}
        />
      ))}
    </div>
  );
}
