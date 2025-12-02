import apiClient from "@/shared/api/apiClient";

export const getLessonById = (lessonId: string) =>
  apiClient.get(`/lessons/${lessonId}`);
