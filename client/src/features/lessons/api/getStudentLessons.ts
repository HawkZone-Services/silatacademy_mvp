// src/features/lessons/api/getStudentLessons.ts
import apiClient from "@/shared/api/apiClient";
import { StudentLessonsResponse } from "../types/lesson.types";

export const getStudentLessons = () =>
  apiClient.get("/lessons/student/available");
