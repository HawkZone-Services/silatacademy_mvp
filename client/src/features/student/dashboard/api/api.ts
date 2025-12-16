// src/features/student/dashboard/api.ts

import attendanceService from "@/services/attendanceService";
import examService from "@/services/examService";
import certificateService from "@/services/certificateService";
import { getStudentLessons as getStudentLessonsRaw } from "@/features/lessons/api/getStudentLessons";

import {
  AttendanceSummary,
  AttemptItem,
  BeltLevel,
  CertificateItem,
  ExamItem,
  LessonItem,
  StudentInfo,
} from "./types";
import { getMe } from "./getStudentOverview";
import { getMySummary } from "./getStudentAttendance";
import { getMyAttendance } from "./getAttendanceRecords";
import { getAvailableExams } from "./getAvailableExams";
import { getMyAttempts } from "@/features/exams/api/getMyAttempts";
import { startAttempt } from "./startAttempt";
import { myCertificates } from "./myCertificates";
import apiClient from "@/shared/api/apiClient";

// ============ Student / Overview ============
export const getStudentOverview = async (): Promise<StudentInfo | null> => {
  const res: any = await getMe();
  if (!res) return null;

  if (res?.success === false) return null;

  const payload = res.data || res.raw || {};
  const data = payload.player || payload.user || payload;

  if (!data?._id) return null;

  return {
    _id: data._id,
    name: data.name,
    beltLevel: data.beltLevel,
    beltLabel: data.beltLabel,
    beltColor: data.beltColor,
    stats: data.stats || {},
  };
};

// ============ Attendance ============
export const getAttendanceSummary =
  async (): Promise<AttendanceSummary | null> => {
    try {
      const res: any = await getMySummary();
      if (res?.success === false) return null;

      const summary = res.data?.summary || res.data || res.raw || {};

      return {
        totalSessions: summary.totalSessions || 0,
        attendedSessions: summary.attendedSessions || 0,
        absentSessions: summary.absentSessions || 0,
        attendanceRate: summary.attendanceRate || 0,
        lastSessionDate: summary.lastSessionDate,
      };
    } catch (error) {
      console.error("Attendance fetch error:", error);
      return null;
    }
  };

export const getAttendanceRecords = async (): Promise<any[]> => {
  try {
    const res: any = await getMyAttendance();
    const logs = Array.isArray(res?.data?.attendance)
      ? res.data.attendance
      : Array.isArray(res?.data)
      ? res.data
      : [];
    return logs;
  } catch (error) {
    console.error("Attendance logs fetch error:", error);
    return [];
  }
};

// ============ Lessons ============
export const getStudentLessonsList = async (): Promise<LessonItem[]> => {
  try {
    const res: any = await getStudentLessonsRaw();

    const lessons =
      res?.data?.data?.lessons || res?.data?.lessons || res?.data || [];

    return lessons;
  } catch (error) {
    console.error("Lessons fetch error:", error);
    return [];
  }
};

// ============ Exams ============
export const getStudentExams = async (
  beltLevel: BeltLevel
): Promise<ExamItem[]> => {
  try {
    const res: any = await getAvailableExams(beltLevel);

    if (res?.success === false) {
      return [];
    }

    const list = Array.isArray(res?.data?.exams)
      ? res.data.exams
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return list;
  } catch (error) {
    console.error("Exams fetch error:", error);
    return [];
  }
};

export const getStudentAttempts = async (): Promise<AttemptItem[]> => {
  try {
    const res: any = await getMyAttempts();

    if (res?.success === false) {
      return [];
    }

    const list = Array.isArray(res?.data?.attempts)
      ? res.data.attempts
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return list;
  } catch (error) {
    console.error("Attempts fetch error:", error);
    return [];
  }
};

export const startExamAttempt = async (
  examId: string
): Promise<string | null> => {
  try {
    const res: any = await startAttempt(examId);

    if (res?.success === false) {
      const reason =
        res?.error?.details?.reason ||
        (Array.isArray(res?.error?.details)
          ? res.error.details[0]?.msg || res.error.details[0]
          : res?.error?.details) ||
        res?.error?.message ||
        res?.message;

      alert(reason || "Unable to start exam");
      return null;
    }

    const attemptId =
      res.data?.attemptId ||
      res.data?.attempt?._id ||
      res.attemptId ||
      res.data?.data?.attemptId;

    return attemptId || null;
  } catch (error) {
    console.error("Start exam error:", error);
    alert("Unable to start exam");
    return null;
  }
};

// ============ Certificates ============
export const getStudentCertificates = async (): Promise<CertificateItem[]> => {
  try {
    const res: any = await myCertificates();

    if (res?.success === false) {
      return [];
    }

    const list = Array.isArray(res?.data?.certificates)
      ? res.data.certificates
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return list;
  } catch (error) {
    console.error("Certificates fetch error:", error);
    return [];
  }
};

// Belt Progress (Attendance + Lessons + Exam eligibility)
export const getBeltProgress = async () => {
  const res = await apiClient.get("/players/me/belt-progress");
  return res?.data?.data;
};
