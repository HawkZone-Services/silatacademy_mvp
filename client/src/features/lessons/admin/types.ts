// src/features/admin/lessons/types.ts

export interface ProgramLite {
  _id: string;
  title: string;
  level?: string | number | null;
}

export interface ModuleLite {
  _id: string;
  title: string;
}

export interface LessonQuizQuestion {
  _id?: string;
  question: string;
  type?: "mcq" | "truefalse" | "essay";
  choices?: string[];
  correctIndex?: number;
}

export interface Lesson {
  _id: string;
  title: string;
  summary?: string;
  videoUrl?: string;
  technicalContent?: string;
  medicalContent?: string;
  psychologyContent?: string;
  content?: string;
  durationMinutes?: number;
  resources?: string[];
  order?: number;
  quiz?: LessonQuizQuestion[];
  isActive?: boolean;
  program?: ProgramLite | string | null;
  module?: ModuleLite | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLessonsListResponse {
  success: boolean;
  lessons: Lesson[];
}

export interface AdminLessonResponse {
  success: boolean;
  lesson: Lesson;
}
