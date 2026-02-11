// src/features/lessons/types/lesson.types.ts

import {
  LessonContract,
  LessonProgressContract,
  QuizQuestionContract,
} from "../contracts/lesson.contract";

/**
 * Lesson as used inside the frontend
 * (currently identical to backend contract)
 */
export type Lesson = LessonContract;

/**
 * Progress of a lesson for a student
 */
export type LessonProgress = LessonProgressContract;

/**
 * Quiz question (Quick Check)
 */
export type QuizQuestion = QuizQuestionContract;

/**
 * Lesson Step type
 * Used for stepper UI & trackStep API
 */
export type LessonStep = "video" | "pdf" | "drill" | "safety";

/**
 * Lesson state union
 * Used for UI conditions
 */
export type LessonState =
  | "not_started"
  | "video_done"
  | "pdf_done"
  | "drill_done"
  | "safety_done"
  | "quiz_passed"
  | "completed";

/**
 * Assignment status
 */
export type AssignmentStatus = "pending" | "approved" | "rejected";
