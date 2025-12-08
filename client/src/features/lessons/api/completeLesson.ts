// src/features/lessons/api/completeLesson.ts
import apiClient from "@/shared/api/apiClient";

export const completeLesson = (lessonId: string) =>
  apiClient.post(`/lessons/student/${lessonId}/complete`, {});
