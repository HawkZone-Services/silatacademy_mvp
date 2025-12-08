// src/features/lessons/api/getLessonQuiz.ts
import apiClient from "@/shared/api/apiClient";
import { LessonQuizApiResponse } from "../types/lesson.types";

export const getLessonQuiz = (lessonId: string) =>
  apiClient.get<LessonQuizApiResponse>(`/lessons/student/${lessonId}/quiz`);
