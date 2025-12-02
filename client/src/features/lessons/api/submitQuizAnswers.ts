import apiClient from "@/shared/api/apiClient";

export const submitQuizAnswers = (lessonId: string, body: any) =>
  apiClient.post(`/lessons/${lessonId}/quiz/submit`, body);
