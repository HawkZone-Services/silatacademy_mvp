import { Lesson, LessonProgress } from "../../types/lesson.types";
import { LESSON_STEPS } from "../../constants/lessonSteps";

type Props = {
  lesson: Lesson;
  progress: LessonProgress | null;
  onStepClick?: (step: string) => void;
};

export function LessonStepper({ lesson, progress, onStepClick }: Props) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {LESSON_STEPS.map((step, index) => {
        const status = getStepStatus(step.key, progress);

        return (
          <StepItem
            key={step.key}
            label={step.label}
            status={status}
            onClick={
              status === "active" ? () => onStepClick?.(step.key) : undefined
            }
          />
        );
      })}
    </div>
  );
}
