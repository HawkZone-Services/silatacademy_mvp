// src/features/lessons/types/lesson.types.ts

export type BeltLevel = "white" | "yellow" | "blue" | "brown" | "red" | "black";

export interface LessonProgress {
  _id?: string;
  lesson: string;
  user: string;
  completed: boolean;
  positionSeconds?: number;
  quizScore?: number;
  lastVisitedAt?: string;
  lastAccessedAt?: string;
}

export interface LessonBase {
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
  isActive?: boolean;
  program?: {
    _id: string;
    title: string;
    level?: string;
  } | null;
  module?: {
    _id: string;
    title: string;
  } | null;
}

export interface LessonWithEligibility extends LessonBase {
  locked?: boolean;
  lockedReason?: string | null;
  isEligible?: boolean;
  reasonIfNotEligible?: string | null;
  programLevel?: "beginner" | "intermediate" | "advanced";
  progress?: LessonProgress | null;
}

export interface StudentLessonsResponse {
  success: boolean;
  data: {
    attendance?: {
      totalSessions: number;
      attendedSessions: number;
      absentSessions: number;
      attendanceRate: number;
      lastSessionDate?: string;
    };
    lessons: LessonWithEligibility[];
  };
}

export interface LessonDetailResponse {
  success: boolean;
  lesson: LessonBase;
  progress?: LessonProgress | null;
}

// Quiz

export type LessonQuizQuestionType = "mcq" | "truefalse" | "essay";

export interface LessonQuizQuestion {
  _id?: string;
  question: string;
  type: LessonQuizQuestionType;
  choices?: string[];
  correctIndex?: number; // backend uses this
  correctBoolean?: boolean;
}

export interface LessonQuizPayload {
  title?: string;
  questions: LessonQuizQuestion[];
}

export interface LessonQuizApiResponse {
  success: boolean;
  data: {
    lesson: LessonBase & {
      quiz?: LessonQuizQuestion[];
    };
  };
}

export interface SubmitLessonQuizResponse {
  success: boolean;
  data: {
    score: number;
    passed: boolean;
    progress: LessonProgress;
  };
}
