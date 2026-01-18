import { LessonProgress } from "../../types/lesson.types";

export type StepStatus = "locked" | "active" | "completed";

export function getStepStatus(
  step: string,
  progress: LessonProgress | null
): StepStatus {
  if (!progress) {
    return step === "video" ? "active" : "locked";
  }

  switch (step) {
    case "video":
      return progress.videoCompleted ? "completed" : "active";

    case "pdf":
      return progress.videoCompleted
        ? progress.pdfCompleted
          ? "completed"
          : "active"
        : "locked";

    case "drill":
      return progress.pdfCompleted
        ? progress.drillCompleted
          ? "completed"
          : "active"
        : "locked";

    case "safety":
      return progress.drillCompleted
        ? progress.safetyCompleted
          ? "completed"
          : "active"
        : "locked";

    case "quiz":
      return progress.safetyCompleted
        ? progress.quickCheckPassed
          ? "completed"
          : "active"
        : "locked";

    default:
      return "locked";
  }
}
