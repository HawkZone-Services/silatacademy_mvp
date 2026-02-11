// src/features/admin/lessons/api.ts

import apiClient from "@/shared/api/apiClient";
import { AdminLessonsListResponse, AdminLessonResponse, Lesson } from "./types";

export const getAdminLessons = async () => {
  const res = await apiClient.get("/lessons");
  return res;
};

export const getAdminLessonById = async (id: string) => {
  const res = await apiClient.get(`/lessons/${id}`);
  return res;
};

export type CreateLessonPayload = {
  title: string;
  summary?: string;
  videoUrl?: string;
  technicalContent?: string;
  medicalContent?: string;
  psychologyContent?: string;
  content?: string;
  durationMinutes?: number;
  resources?: string[];
  moduleId: string;
  programId: string;
  order?: number;
  quiz?: any[]; // backend uses plain Array for quiz
};

export const createLessonAdmin = async (body: CreateLessonPayload) => {
  const res = await apiClient.post<AdminLessonResponse>("/lessons", body);
  return res;
};

export type UpdateLessonPayload = Partial<CreateLessonPayload> & {
  isActive?: boolean;
};

export const updateLessonAdmin = async (
  id: string,
  body: UpdateLessonPayload
) => {
  const res = await apiClient.patch<AdminLessonResponse>(
    `/lessons/${id}`,
    body
  );
  return res;
};

export const deleteLessonAdmin = async (id: string) => {
  const res = await apiClient.delete(`/lessons/${id}`);
  return res;
};
