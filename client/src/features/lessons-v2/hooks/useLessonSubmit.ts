import { useState } from "react";
import { LessonsV2API } from "../api/lessons.api";
import { LessonFormState } from "./useLessonForm";
import { Lesson } from "../types/lesson.types";

type Args = {
  mode: "create" | "edit";
  lessonId?: string;
  onSuccess?: (lesson: Lesson) => void;
};

export function useLessonSubmit({ mode, lessonId, onSuccess }: Args) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (state: LessonFormState) => {
    setLoading(true);
    setError(null);

    try {
      const lesson =
        mode === "create"
          ? await LessonsV2API.createLesson(state)
          : await LessonsV2API.updateLesson(lessonId!, state);

      onSuccess?.(lesson);
      return lesson;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save lesson");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    error,
  };
}
