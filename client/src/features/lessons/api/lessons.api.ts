import { Lesson, LessonStep } from "../types/lesson.types";
import { api } from "./client";

/**
 * Lessons API
 * -----------------
 * All lesson-related backend calls
 */
export const LessonsAPI = {
  /**
   * Get all available lessons for the student
   */
  async getLessons(): Promise<{ data: Lesson[] }> {
    const res = await api.get("/lessons");
    return res.data;
  },

  /**
   * Track completion of a lesson step
   * (video | pdf | drill | safety)
   */
  async trackStep(lessonId: string, step: LessonStep) {
    return api.post(`/lessons/${lessonId}/track`, { step });
  },

  /**
   * Submit Quick Check (Quiz)
   */
  async submitQuiz(lessonId: string, answers: number[]) {
    return api.post(`/lessons/${lessonId}/quiz`, { answers });
  },

  /**
   * Complete lesson (final gate)
   */
  async completeLesson(lessonId: string) {
    return api.post(`/lessons/${lessonId}/complete`);
  },
};
