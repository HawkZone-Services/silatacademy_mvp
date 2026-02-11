import { useState } from "react";
import { LessonsV2API } from "../api/lessons.api";
import { LessonProgress } from "../types/lesson.types";

type QuizResult = {
  score: number;
  passed: boolean;
  progress: LessonProgress;
};

type Args = {
  lessonId: string;
  onPassed?: () => void;
};

export function useLessonQuiz({ lessonId, onPassed }: Args) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const submitQuiz = async (answers: number[]) => {
    setLoading(true);
    setError(null);

    try {
      const data = await LessonsV2API.submitQuiz(lessonId, answers);
      setResult(data);

      if (data.passed) {
        onPassed?.();
      }

      return data;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to submit quiz");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitQuiz,
    loading,
    error,
    result,
  };
}
