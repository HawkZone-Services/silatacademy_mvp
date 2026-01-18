import { useState } from "react";
import { Lesson, LessonProgress, LessonStep } from "../types/lesson.types";
import { LessonsV2API } from "../api/lessons.api";

type Args = {
  lesson: Lesson;
};

export function useLessonPlayer({ lesson }: Args) {
  const [progress, setProgress] = useState<LessonProgress | null>(
    lesson.progress
  );
  const [loadingStep, setLoadingStep] = useState<LessonStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completeStep = async (step: LessonStep) => {
    setLoadingStep(step);
    setError(null);

    // 🟢 Optimistic update
    setProgress((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [`${step}Completed`]: true,
      } as LessonProgress;
    });

    try {
      const updated = await LessonsV2API.trackStep(lesson._id, step);
      setProgress(updated);
    } catch (e: any) {
      // 🔴 Rollback on error
      setProgress(lesson.progress || null);
      setError("Failed to complete step");
    } finally {
      setLoadingStep(null);
    }
  };
  return {
    progress,
    completeStep,
    loadingStep,
    error,
  };
}
