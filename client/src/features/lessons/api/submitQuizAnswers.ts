// src/features/lessons/api/submitLessonQuiz.ts
import apiClient from "@/shared/api/apiClient";
import { SubmitLessonQuizResponse } from "../types/lesson.types";

export interface SubmitLessonQuizBody {
  answers: {
    questionIndex: number;
    selectedIndex?: number;
  }[];
}

export const submitLessonQuiz = (
  lessonId: string,
  body: SubmitLessonQuizBody
) => apiClient.post(`/lessons/student/${lessonId}/quiz/submit`, body);
