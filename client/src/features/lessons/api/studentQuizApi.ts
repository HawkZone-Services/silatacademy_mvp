import apiClient from "@/shared/api/apiClient";

export const getLessonQuiz = (lessonId: string) =>
  apiClient.get(`/lessons/student/${lessonId}/quiz`);

export const submitLessonQuiz = (lessonId: string, answers: any[]) =>
  apiClient.post(`/lessons/student/${lessonId}/quiz/submit`, { answers });
