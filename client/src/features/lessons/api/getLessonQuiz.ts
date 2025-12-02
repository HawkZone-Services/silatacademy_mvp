import apiClient from "@/shared/api/apiClient";

export const getLessonQuiz = (lessonId: string) =>
  apiClient.get(`/lessons/${lessonId}/quiz`);
