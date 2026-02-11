import apiClient from "@/shared/api/apiClient";
import { LessonFormState } from "../hooks/useLessonForm";
import { Lesson } from "../types/lesson.types";

export const LessonsV2API = {
  async createLesson(payload: LessonFormState): Promise<Lesson> {
    const res = await apiClient.post("/lessons", payload);
    return res.data.data;
  },
  async trackStep(lessonId: string, step: LessonStep) {
    const res = await apiClient.post(`/lessons/${lessonId}/track`, { step });
    return res.data.data; // updated LessonProgress
  },

  async updateLesson(
    lessonId: string,
    payload: LessonFormState
  ): Promise<Lesson> {
    const res = await apiClient.put(`/lessons/${lessonId}`, payload);
    return res.data.data;
  },
  async getLessonById(lessonId: string): Promise<Lesson> {
    const res = await apiClient.get(`/lessons/${lessonId}`);
    return res.data.data;
  },
  async submitQuiz(lessonId: string, answers: number[]) {
    const res = await apiClient.post(`/lessons/${lessonId}/quiz`, { answers });
    return res.data.data;
    // { score, passed, progress }
  },
  async completeLesson(lessonId: string) {
    const res = await apiClient.post(`/lessons/${lessonId}/complete`);
    return res.data.data; // updated LessonProgress
  },
};
