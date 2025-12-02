import { LessonCard } from "./LessonCard";

type LessonListProps = {
  lessons: any[];
  onSelect?: (lesson: any) => void;
};

export function LessonList({ lessons, onSelect }: LessonListProps) {
  if (!lessons?.length) {
    return <p className="text-sm text-muted-foreground">No lessons available.</p>;
  }

  return (
    <div className="grid gap-3">
      {lessons.map((lesson) => (
        <LessonCard key={lesson._id} lesson={lesson} onSelect={onSelect} />
      ))}
    </div>
  );
}
