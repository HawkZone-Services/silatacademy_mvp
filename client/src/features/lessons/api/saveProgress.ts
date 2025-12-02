import apiClient from "@/shared/api/apiClient";

export const saveProgress = (lessonId: string, body: any) =>
  apiClient.post(`/lessons/${lessonId}/progress`, body);
