import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Calendar,
  Trophy,
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import playerService from "@/services/playerService";
import attendanceService from "@/services/attendanceService";
import lessonService from "@/services/lessonService";
import examService from "@/services/examService";
import certificateService from "@/services/certificateService";
import { LearningPathSection } from "@/features/lessons/components/LearningPathSection";
import { getStudentLessons } from "@/features/lessons/api/getStudentLessons";
import StudentLessonsPage from "@/features/lessons/pages/StudentLessonsPage";

// ======================
// Types (مرنة لو الـ API مختلف شويه)
// ======================
type BeltLevel = "white" | "yellow" | "blue" | "brown" | "red" | "black";

interface StudentInfo {
  _id: string;
  name: string;
  beltLevel?: BeltLevel;
  beltLabel?: string;
  beltColor?: string;
  stats?: {
    power?: number;
    flexibility?: number;
    endurance?: number;
    speed?: number;
  };
}

interface AttendanceSummary {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  attendanceRate: number; // 0–100
  lastSessionDate?: string;
}

interface LessonItem {
  _id: string;
  title: string;
  beltLevel?: BeltLevel;
  programLevel?: "beginner" | "intermediate" | "advanced";
  completed?: boolean;
  locked?: boolean;
  lockedReason?: string | null;
  isEligible?: boolean;
  reasonIfNotEligible?: string | null;
}

interface ExamItem {
  _id: string;
  title: string;
  beltLevel: BeltLevel;
  status: string; // published / draft / ...
  locked?: boolean;
  isEligible?: boolean;
  lockedReason?: string | null;
  reasonIfNotEligible?: string | null;
  lessonsRequired?: number;
  lessonsCompleted?: number;
}

interface AttemptItem {
  _id: string;
  exam: {
    _id: string;
    title: string;
    beltLevel: BeltLevel;
    maxTheoryScore?: number;
  };
  theoryScore?: number;
  finalTotalScore?: number;
  finalPassed?: boolean;
  submittedAt?: string;
  finalizedAt?: string;
}

interface CertificateItem {
  _id: string;
  title?: string;
  beltLevel?: BeltLevel;
  type?: string;
  issuedAt?: string;
}

// ======================
// Helper: belt UI
// ======================
const beltLabel = (belt?: BeltLevel) => {
  if (!belt) return "Unranked";
  return `${belt.charAt(0).toUpperCase()}${belt.slice(1)} Belt`;
};

const beltColorClass = (belt?: BeltLevel) => {
  switch (belt) {
    case "white":
      return "bg-white text-black border";
    case "yellow":
      return "bg-yellow-400 text-black";
    case "blue":
      return "bg-blue-500 text-white";
    case "brown":
      return "bg-amber-800 text-white";
    case "red":
      return "bg-red-500 text-white";
    case "black":
      return "bg-black text-white";
    default:
      return "bg-muted text-foreground";
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  // ============ AUTH ============
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const beltLevel = student?.beltLevel || "white";

  // أي تحكم بسيط في تبويب الاختبارات
  const [selectedExamTab, setSelectedExamTab] = useState<
    "available" | "history"
  >("available");

  // ======================
  // Check auth on mount
  // ======================
  const checkAuth = () => {
    const savedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !savedUser) {
      navigate("/login");
    }
  };

  // ===============================
  // Fetch Attempts / Results
  // ===============================
  const fetchResults = useCallback(async () => {
    if (!token) return [];

    try {
      const res: any = await examService.getMyAttempts();
      const attempts = Array.isArray(res?.data?.attempts)
        ? res.data.attempts
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setResults(attempts);
      return attempts;
    } catch (err) {
      console.error("Fetch results error:", err);
      setResults([]);
      return [];
    }
  }, [token]);

  // ======================
  // Fetchers (using apiClient normalized responses)
  // ======================
  const fetchStudent = async () => {
    const res: any = await playerService.getMe();
    if (res?.success) {
      const payload = res.data || res.raw || {};
      const data = payload.player || payload.user || payload;
      if (data?._id) {
        setStudent({
          _id: data._id,
          name: data.name,
          beltLevel: data.beltLevel,
          beltLabel: data.beltLabel,
          beltColor: data.beltColor,
          stats: data.stats || {},
        });
      }
    }
  };
  const fetchAttendanceRecords = async () => {
    try {
      const res = await attendanceService.getMyAttendance();
      const logs = Array.isArray(res?.data?.attendance)
        ? res.data.attendance
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setAttendanceRecords(logs);
    } catch (error) {
      console.error("Attendance logs fetch error:", error);
    }
  };
  const fetchAttendance = async () => {
    try {
      const res: any = await attendanceService.getMySummary();
      if (res?.success === false) return;

      const summary = res.data?.summary || res.data || res.raw || {};
      setAttendance({
        totalSessions: summary.totalSessions || 0,
        attendedSessions: summary.attendedSessions || 0,
        absentSessions: summary.absentSessions || 0,
        attendanceRate: summary.attendanceRate || 0,
        lastSessionDate: summary.lastSessionDate,
      });
    } catch (error) {
      console.error("Attendance fetch error:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const res: any = await getStudentLessons();

      const lessons =
        res?.data?.data?.lessons || res?.data?.lessons || res?.data || [];

      setLessons(lessons);
    } catch (error) {
      console.error("Lessons fetch error:", error);
      setLessons([]);
    }
  };
  const fetchExams = async () => {
    try {
      const res: any = await examService.getAvailableExams(beltLevel);
      if (res?.success === false) {
        setExams([]);
        return;
      }
      const list = Array.isArray(res?.data?.exams)
        ? res.data.exams
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setExams(list);
    } catch (error) {
      console.error("Exams fetch error:", error);
      setExams([]);
    }
  };

  const fetchAttempts = async () => {
    try {
      const res: any = await examService.getMyAttempts();
      if (res?.success === false) {
        setAttempts([]);
        return;
      }
      const list = Array.isArray(res?.data?.attempts)
        ? res.data.attempts
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setAttempts(list);
    } catch (error) {
      console.error("Attempts fetch error:", error);
      setAttempts([]);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res: any = await certificateService.myCertificates();
      if (res?.success === false) {
        setCertificates([]);
        return;
      }
      const list = Array.isArray(res?.data?.certificates)
        ? res.data.certificates
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setCertificates(list);
    } catch (error) {
      console.error("Certificates fetch error:", error);
      setCertificates([]);
    }
  };

  // ======================
  // Start / Continue Exam
  // ======================
  const canAccessExam = (exam: ExamItem) => {
    if (exam.locked || exam.isEligible === false) return false;
    return true;
  };

  const handleStartExam = async (exam: ExamItem) => {
    if (!canAccessExam(exam)) return;

    try {
      const res: any = await examService.startAttempt(exam._id);
      if (res?.success === false) {
        const reason =
          res?.error?.details?.reason ||
          (Array.isArray(res?.error?.details)
            ? res.error.details[0]?.msg || res.error.details[0]
            : res?.error?.details) ||
          res?.error?.message ||
          res?.message;
        alert(reason || "Unable to start exam");
        return;
      }
      const attemptId =
        res.data?.attemptId ||
        res.data?.attempt?._id ||
        res.attemptId ||
        res.data?.data?.attemptId;
      if (attemptId) {
        navigate(`/student/exams/${exam._id}?attempt=${attemptId}`);
      }
    } catch (error) {
      console.error("Start exam error:", error);
      alert("Unable to start exam");
    }
  };

  // ======================
  // Effects
  // ======================
  useEffect(() => {
    checkAuth();

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchStudent(),
        fetchAttendance(),
        fetchLessons(),
        fetchExams(),
        fetchAttempts(),
        fetchCertificates(),
      ]);
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

  const attendanceRate = attendance?.attendanceRate ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-10 mt-16 space-y-8">
        {/* =======================
            Header / Overview
        ======================== */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              Welcome back,
              <span className="text-secondary">
                {student?.name || "Student"}
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your training, attendance, lessons, and exams in one place.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge
              className={`px-4 py-2 text-sm font-semibold ${beltColorClass(
                student?.beltLevel
              )}`}
            >
              {beltLabel(student?.beltLevel)}
            </Badge>
            {attendance && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance: {attendanceRate.toFixed(0)}%
              </div>
            )}
          </div>
        </section>

        {/* =======================
            Stats Cards
        ======================== */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {attendanceRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={attendanceRate} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Lessons Completed
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {lessons.length ? (
                <>
                  <div className="text-2xl font-bold">
                    {lessons.filter((l) => l.completed).length} /{" "}
                    {lessons.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across your current belt level
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No lessons assigned yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Available Exams
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Exams open for registration / attempts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed programs, exams, and milestones
              </p>
            </CardContent>
          </Card>
        </section>

        {/* =======================
            TABS
        ======================== */}
        <Tabs defaultValue="learning" className="space-y-6">
          <TabsList>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
            <TabsTrigger value="exams">Exams & Results</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* ========== LEARNING PATH ========== */}
          <TabsContent value="learning" className="space-y-4">
            <StudentLessonsPage />
          </TabsContent>

          {/* ========== EXAMS & RESULTS ========== */}
          <TabsContent value="exams" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Exams & Results
              </h2>
              <div className="flex gap-2 text-sm">
                <Button
                  variant={
                    selectedExamTab === "available" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedExamTab("available")}
                >
                  Available Exams
                </Button>
                <Button
                  variant={
                    selectedExamTab === "history" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedExamTab("history")}
                >
                  My Attempts
                </Button>
              </div>
            </div>

            {selectedExamTab === "available" && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Exams</CardTitle>
                  <CardDescription>
                    Exams you can register for or start, based on your
                    attendance and lesson completion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exams.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No available exams at the moment.
                    </p>
                  )}

                  {exams.map((exam) => {
                    const locked = exam.locked || exam.isEligible === false;
                    const reason =
                      exam.reasonIfNotEligible || exam.lockedReason || null;
                    const progressText =
                      typeof exam.lessonsRequired === "number"
                        ? `${exam.lessonsCompleted || 0}/${
                            exam.lessonsRequired
                          } lessons completed`
                        : null;

                    return (
                      <div
                        key={exam._id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-accent/10"
                      >
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {exam.title}
                            <Badge
                              variant="outline"
                              className="capitalize text-xs"
                            >
                              {exam.beltLevel || "belt"}
                            </Badge>
                            {locked && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 text-xs"
                              >
                                <AlertCircle className="h-3 w-3" /> Locked
                              </Badge>
                            )}
                          </h3>
                          {progressText && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {progressText}
                            </p>
                          )}
                          {reason && (
                            <p className="text-xs text-red-600 mt-1">
                              {reason}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          disabled={locked}
                          onClick={() => handleStartExam(exam)}
                        >
                          {locked ? "Locked" : "Start Exam"}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {selectedExamTab === "history" && (
              <Card>
                <CardHeader>
                  <CardTitle>My Attempts & Results</CardTitle>
                  <CardDescription>
                    Track your theory scores, practical evaluation, and final
                    results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {attempts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      You haven&apos;t taken any exams yet.
                    </p>
                  )}

                  {attempts.map((att) => {
                    const exam = att.exam || {};
                    const statusLabel = att.finalPassed
                      ? "Passed"
                      : att.finalPassed === false
                      ? "Failed"
                      : att.submittedAt
                      ? "Waiting for practical"
                      : "In progress";

                    return (
                      <div
                        key={att._id}
                        className="p-3 rounded-lg border border-border/50 bg-accent/10 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {exam.title}
                            <Badge
                              variant="outline"
                              className="capitalize text-xs"
                            >
                              {exam.beltLevel || "belt"}
                            </Badge>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Theory: {att.theoryScore ?? 0} /{" "}
                            {exam.maxTheoryScore ?? "?"} • Final:{" "}
                            {att.finalTotalScore ?? "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {statusLabel}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/student/exams/${exam._id}?attempt=${att._id}`
                            )
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ========== CERTIFICATES ========== */}
          <TabsContent value="certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Certificates</CardTitle>
                <CardDescription>
                  Official certificates for completed exams, programs, and
                  special achievements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {certificates.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have any certificates yet.
                  </p>
                )}

                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="p-3 rounded-lg border border-border/50 bg-accent/10 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {cert.title || "Certificate"}
                        {cert.type && (
                          <Badge variant="outline" className="text-xs">
                            {cert.type}
                          </Badge>
                        )}
                        {cert.beltLevel && (
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {cert.beltLevel}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Issued at:{" "}
                        {cert.issuedAt
                          ? new Date(cert.issuedAt).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/certificate/${cert._id}`)}
                    >
                      View / Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== ATTENDANCE (FULL INTEGRATION) ========== */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Details</CardTitle>
                <CardDescription>
                  Your session attendance, trends, and daily logs.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* ====================
          SUMMARY SECTION
      ===================== */}
                {attendance ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg bg-accent/10">
                        <p className="text-xs text-muted-foreground">
                          Total Sessions
                        </p>
                        <p className="text-xl font-semibold">
                          {attendance.totalSessions}
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg bg-accent/10">
                        <p className="text-xs text-muted-foreground">
                          Attended
                        </p>
                        <p className="text-xl font-semibold">
                          {attendance.attendedSessions}
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg bg-accent/10">
                        <p className="text-xs text-muted-foreground">Absent</p>
                        <p className="text-xl font-semibold">
                          {attendance.absentSessions}
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg bg-accent/10">
                        <p className="text-xs text-muted-foreground">
                          Last Session
                        </p>
                        <p className="text-sm font-medium">
                          {attendance.lastSessionDate
                            ? new Date(
                                attendance.lastSessionDate
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Attendance Rate
                      </p>
                      <Progress value={attendance.attendanceRate} />
                    </div>
                  </>
                ) : (
                  <p>No attendance summary yet.</p>
                )}

                {/* ====================
          DAILY RECORDS TABLE
      ===================== */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-semibold text-sm">
                    Attendance Records
                  </div>

                  {attendanceRecords.length === 0 ? (
                    <div className="p-4 text-muted-foreground text-sm">
                      No attendance records found.
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-accent/10">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Coach</th>
                          <th className="px-3 py-2">Notes</th>
                        </tr>
                      </thead>

                      <tbody>
                        {attendanceRecords.map((log) => (
                          <tr key={log._id} className="border-t">
                            <td className="px-3 py-2">
                              {new Date(log.sessionDate).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2">
                              <Badge
                                variant="outline"
                                className={`capitalize ${
                                  log.status === "present"
                                    ? "text-green-600 border-green-600"
                                    : "text-red-600 border-red-600"
                                }`}
                              >
                                {log.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">
                              {log.coachName || "—"}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {log.notes || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
