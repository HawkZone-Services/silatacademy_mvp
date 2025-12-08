// src/features/lessons/api/saveProgress.ts
import apiClient from "@/shared/api/apiClient";

export interface SaveProgressBody {
  positionSeconds?: number;
  completed?: boolean;
  quizAnswers?: {
    questionIndex: number;
    selectedIndex?: number;
  }[];
}

export const saveProgress = (lessonId: string, body: SaveProgressBody) =>
  apiClient.post(`/lessons/student/${lessonId}/progress`, body);
