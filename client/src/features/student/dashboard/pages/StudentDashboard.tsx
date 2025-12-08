// src/features/student/dashboard/pages/StudentDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewHeader from "../components/OverviewHeader";
import StatsCards from "../components/StatsCards";
import LearningTab from "../components/LearningTab";
import ExamsTab from "../components/ExamsTab";
import CertificatesTab from "../components/CertificatesTab";
import AttendanceTab from "../components/AttendanceTab";

import {
  getAttendanceRecords,
  getAttendanceSummary,
  getStudentAttempts,
  getStudentCertificates,
  getStudentExams,
  getStudentLessonsList,
  getStudentOverview,
} from "../api/api";

import {
  AttendanceSummary,
  AttemptItem,
  CertificateItem,
  ExamItem,
  LessonItem,
  StudentInfo,
  BeltLevel,
} from "../types";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const beltLevel: BeltLevel = (student?.beltLevel || "white") as BeltLevel;

  const checkAuth = () => {
    const savedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !savedUser) {
      navigate("/login");
    }
  };

  useEffect(() => {
    checkAuth();

    const loadAll = async () => {
      setLoading(true);

      const [
        studentInfo,
        attendanceSummary,
        lessonsList,
        examsList,
        attemptsList,
        certs,
        attendanceLogs,
      ] = await Promise.all([
        getStudentOverview(),
        getAttendanceSummary(),
        getStudentLessonsList(),
        getStudentExams(beltLevel),
        getStudentAttempts(),
        getStudentCertificates(),
        getAttendanceRecords(),
      ]);

      setStudent(studentInfo);
      setAttendance(attendanceSummary);
      setLessons(lessonsList);
      setExams(examsList);
      setAttempts(attemptsList);
      setCertificates(certs);
      setAttendanceRecords(attendanceLogs);

      setLoading(false);
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading your dashboard...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-10 mt-16 space-y-8">
        <OverviewHeader student={student} attendance={attendance} />

        <StatsCards
          attendance={attendance}
          lessons={lessons}
          exams={exams}
          certificates={certificates}
        />

        <Tabs defaultValue="learning" className="space-y-6">
          <TabsList>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
            <TabsTrigger value="exams">Exams & Results</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <LearningTab />
          <ExamsTab exams={exams} attempts={attempts} />
          <CertificatesTab certificates={certificates} />
          <AttendanceTab
            attendance={attendance}
            attendanceRecords={attendanceRecords}
          />
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
