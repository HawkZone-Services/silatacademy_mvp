import { useState } from "react";
import { Lesson, QuizQuestion } from "../types/lesson.types";

export type LessonFormState = {
  module: string;
  program: string;

  title: string;
  summary?: string;
  order: number;
  durationMinutes?: number;

  videoUrl?: string;

  technicalContent?: string;
  content?: string;
  medicalContent?: string;
  psychologyContent?: string;

  resources: string[];
  quiz: QuizQuestion[];
};

type UseLessonFormArgs = {
  mode: "create" | "edit";
  initialData?: Lesson;
};

export function useLessonForm({ mode, initialData }: UseLessonFormArgs) {
  const initialState: LessonFormState =
    mode === "edit" && initialData
      ? {
          module: initialData.module._id,
          program: initialData.program._id,

          title: initialData.title,
          summary: initialData.summary,
          order: initialData.order,
          durationMinutes: initialData.durationMinutes,

          videoUrl: initialData.videoUrl,
          technicalContent: initialData.technicalContent,
          content: initialData.content,
          medicalContent: initialData.medicalContent,
          psychologyContent: initialData.psychologyContent,

          resources: initialData.resources || [],
          quiz: initialData.quiz || [],
        }
      : {
          module: "",
          program: "",
          title: "",
          summary: "",
          order: 1,
          durationMinutes: undefined,

          videoUrl: "",
          technicalContent: "",
          content: "",
          medicalContent: "",
          psychologyContent: "",

          resources: [],
          quiz: [],
        };

  const [state, setState] = useState<LessonFormState>(initialState);

  const updateField = <K extends keyof LessonFormState>(
    key: K,
    value: LessonFormState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };
  const isDirty = JSON.stringify(state) !== JSON.stringify(initialState);

  return {
    state,
    setState,
    updateField,
    isEditMode: mode === "edit",
    isDirty,
  };
}
