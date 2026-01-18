import { useState } from "react";
import { LessonsV2API } from "../api/lessons.api";
import { LessonProgress } from "../types/lesson.types";

export function useCompleteLesson(lessonId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeLesson = async () => {
    setLoading(true);
    setError(null);

    try {
      const progress = await LessonsV2API.completeLesson(lessonId);
      return progress;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to complete lesson");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeLesson,
    loading,
    error,
  };
}
