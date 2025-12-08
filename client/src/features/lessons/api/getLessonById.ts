// src/features/lessons/api/getLessonById.ts
import apiClient from "@/shared/api/apiClient";
import { LessonDetailResponse } from "../types/lesson.types";

export const getLessonById = (lessonId: string) =>
  apiClient.get(`/lessons/student/${lessonId}`);
