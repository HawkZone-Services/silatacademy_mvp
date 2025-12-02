import apiClient from "@/shared/api/apiClient";

export const completeLesson = (lessonId: string, body: any) =>
  apiClient.post(`/lessons/student/${lessonId}/complete`, body);
