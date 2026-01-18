import { LessonProgress } from "../../types/lesson.types";

type Props = {
  progress: LessonProgress;
  onComplete: () => void;
  loading?: boolean;
};

export function CompleteLessonButton({ progress, onComplete, loading }: Props) {
  const canComplete =
    progress.videoCompleted &&
    progress.pdfCompleted &&
    progress.drillCompleted &&
    progress.safetyCompleted &&
    progress.quickCheckPassed;

  const blockedByAssignment =
    progress.assignmentRequired && progress.assignmentStatus !== "approved";

  if (!canComplete) return null;

  return (
    <div>
      {blockedByAssignment && (
        <p style={{ color: "orange" }}>
          Assignment must be approved before completing this lesson.
        </p>
      )}

      <button onClick={onComplete} disabled={blockedByAssignment || loading}>
        Complete Lesson
      </button>
    </div>
  );
}
