import { LessonStep } from "../types/lesson.types";

export type LessonStepItem = {
  key: LessonStep | "quiz";
  label: string;
};

export const LESSON_STEPS: LessonStepItem[] = [
  { key: "video", label: "Video" },
  { key: "pdf", label: "Reading" },
  { key: "drill", label: "Drill" },
  { key: "safety", label: "Safety" },
  { key: "quiz", label: "Quick Check" },
];
