// ===============================
// Student Dashboard (FINAL VERSION)
// ===============================

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NotificationsBell from "@/components/player/NotificationsBell";
import NotificationsList from "@/components/player/NotificationsList";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { Calendar, Trophy, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import examService from "@/services/examService";
import certificateService from "@/services/certificateService";

export default function StudentDashboard() {
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const studentName = user?.name || "Student";
  const beltLevel = user?.beltLevel || "white";

  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Fetch Results FIRST
  // ===============================
  const fetchResults = useCallback(async () => {
    if (!token) return [];

    try {
      const res = await examService.getMyAttempts();

      const data = await res.json();

      const attempts = Array.isArray(data.attempts) ? data.attempts : [];
      setResults(attempts);
      return attempts;
    } catch (err) {
      console.error("Fetch results error:", err);
      return [];
    }
  }, [token]);

  // ===============================
  // Exam Registration Status
  // ===============================
  const getExamStatus = useCallback(
    async (examId: string) => {
      try {
        const res = await examService.getRegistrationStatus(examId);

        const data = await res.json();
        return data.status || "none";
      } catch {
        return "none";
      }
    },
    [token]
  );

  // ===============================
  // Fetch Available Exams
  // ===============================
  const fetchAvailableExams = useCallback(
    async (attemptsOverride?: any[]) => {
      try {
        if (!token) return;

        const attemptsList = Array.isArray(attemptsOverride)
          ? attemptsOverride
          : results;
        const attemptByExam = new Map(
          attemptsList.map((r) => [r.exam?._id || r.exam, r])
        );

        const res = await examService.getAvailableExams(beltLevel);

        const data = await res.json();

        if (!Array.isArray(data.exams)) {
          setAvailableExams([]);
          return;
        }

        const examsWithStatus = await Promise.all(
          data.exams.map(async (exam: any) => {
            const status = await getExamStatus(exam._id);

            const passMark = exam.passMark ?? 0;
            const maxTheoryScore = exam.maxTheoryScore ?? 40;
            const passPercent =
              maxTheoryScore > 0
                ? Math.round((passMark / maxTheoryScore) * 100)
                : passMark;

          const attempt = attemptByExam.get(exam._id);
          const attemptStatus = attempt
            ? attempt.submittedAt
              ? "completed"
              : "attempted"
            : "notAttempted";

          return {
            ...exam,
            status,
            passPercent,
            attemptStatus,
            attemptId: attempt?._id,
            locked: Boolean(exam.locked),
            lessonsCompleted: exam.lessonsCompleted,
            lessonsRequired: exam.lessonsRequired,
          };
        })
      );

        const filtered = examsWithStatus.filter((exam) => {
          const att = attemptByExam.get(exam._id);
          if (!att) return true;
          if (att.submittedAt) return false;
          if (
            att.finalPassed !== undefined ||
            att.finalTotalScore !== undefined
          ) {
            return false;
          }
          return true;
        });

        setAvailableExams(filtered);
      } catch (err) {
        console.error("Fetch available exams error:", err);
      }
    },
    [beltLevel, getExamStatus, results, token]
  );

  // ===============================
  // Fetch Certificates
  // ===============================
  const fetchCertificates = useCallback(async () => {
    if (!token) return [];

    try {
      const res = await certificateService.getMyCertificates();

      const data = await res.json();
      if (Array.isArray(data.certificates)) {
        setCertificates(data.certificates);
        return data.certificates;
      }
      setCertificates([]);
      return [];
    } catch (err) {
      console.error("Certificate fetch error:", err);
      return [];
    }
  }, [token]);

  const downloadCertificate = async (
    examId: string,
    studentId?: string | null
  ) => {
    const resolvedStudentId = studentId || user?._id;
    if (!examId || !resolvedStudentId || !token) return;

    try {
      const res = await certificateService.downloadPDF(
        examId,
        resolvedStudentId
      );

      if (!res.ok) {
        throw new Error("Failed to download certificate");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${examId}-${resolvedStudentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: err?.message || "Could not download certificate.",
      });
    }
  };

  const refreshData = useCallback(async () => {
    const attempts = await fetchResults();
    await fetchAvailableExams(attempts);
    await fetchCertificates();
    setLoading(false);
  }, [fetchAvailableExams, fetchCertificates, fetchResults]);

  // ===============================
  // Sync & refresh hooks
  // ===============================
  useEffect(() => {
    if (!token) return;
    refreshData();
  }, [token, refreshData]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, [token, refreshData]);

  useEffect(() => {
    if (localStorage.getItem("refreshResults") === "1") {
      refreshData();
      localStorage.removeItem("refreshResults");
    }
    if (localStorage.getItem("refreshCertificates") === "1") {
      refreshData();
      localStorage.removeItem("refreshCertificates");
    }
  }, [refreshData]);

  // ===============================
  // Register for Exam
  // ===============================
  const handleRegister = async (examId: string) => {
    try {
      const res = await examService.registerForExam({
        examId,
        playerId: user._id,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.message || "Unable to register.",
        });
        return;
      }

      toast({
        title: "Registration Sent",
        description: "Waiting for instructor approval.",
      });

      refreshData();
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  // ===============================
  // Start Exam
  // ===============================
  const handleStartExam = async (examId: string, attemptId?: string) => {
    const existing = results.find((r) => r.exam?._id === examId);
    const existingAttemptId = attemptId || existing?._id;

    if (
      existing &&
      (existing.submittedAt ||
        existing.finalPassed !== undefined ||
        existing.finalTotalScore !== undefined)
    ) {
      toast({
        variant: "destructive",
        title: "Exam Already Completed",
        description: "You cannot retake this exam.",
      });
      return;
    }

    if (existing && existingAttemptId) {
      window.location.href = `/exam/${examId}?attempt=${existingAttemptId}`;
      return;
    }

    try {
      const res = await examService.startAttempt({ examId });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not start exam",
          description: data.message || "Error",
        });
        return;
      }

      toast({
        title: "Exam Started",
        description: "Redirecting...",
      });

      window.location.href = `/exam/${examId}?attempt=${data.attemptId}`;
    } catch (err) {
      console.error("Start exam error:", err);
    }
  };

  // ===============================
  // Stats
  // ===============================
  const certificateByExam: Record<string, any> = certificates.reduce(
    (acc, cert) => {
      const examId = cert.exam?._id || cert.exam || cert.examId;
      if (examId) {
        acc[String(examId)] = cert;
      }
      return acc;
    },
    {}
  );

  const stats = [
    {
      title: "Current Belt",
      value: beltLevel.toUpperCase() + " Belt",
      icon: Award,
      color: "text-secondary",
    },
    {
      title: "Exams Passed",
      value: results.filter((r) => r.finalPassed ?? r.passed).length.toString(),
      icon: Trophy,
      color: "text-primary",
    },
    {
      title: "Attempts",
      value: results.length.toString(),
      icon: TrendingUp,
      color: "text-secondary",
    },
    {
      title: "Next Test",
      value: "Coming Soon",
      icon: Calendar,
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              Welcome back, <span className="text-primary">{studentName}</span>
            </h1>
            <p className="text-muted-foreground">
              Track your progress and continue your Silat journey
            </p>
          </div>
          <NotificationsBell onClick={() => setShowNotifications((v) => !v)} />
        </div>

        {showNotifications && (
          <div className="mb-6">
            <NotificationsList />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    {stat.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="exams">Available Exams</TabsTrigger>
            <TabsTrigger value="results">My Results</TabsTrigger>
            <TabsTrigger value="certs">Certificates</TabsTrigger>
          </TabsList>
          {/* AVAILABLE EXAMS */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Available Exams</CardTitle>
                <CardDescription>Start your belt exams</CardDescription>
              </CardHeader>

              <CardContent>
                {availableExams.length === 0 ? (
                  <p className="text-muted-foreground">No exams available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-border/50">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Exam Title
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Belt Level
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Status
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Attempt Status
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableExams.map((exam) => {
                          const attemptStatus =
                            exam.attemptStatus || "notAttempted";
                          const attemptId = exam.attemptId;
                          const canStart =
                            exam.status === "approved" &&
                            attemptStatus === "notAttempted" &&
                            !exam.locked;
                          const canResume =
                            attemptStatus === "attempted" &&
                            Boolean(attemptId) &&
                            !exam.locked;
                          const alreadyDone = attemptStatus === "completed";

                          let actionLabel = "Register";
                          let disabled = false;
                          let onClick: (() => void) | undefined = () =>
                            handleRegister(exam._id);

                          if (exam.locked) {
                            actionLabel = "Exam Locked";
                            disabled = true;
                            onClick = undefined;
                          } else if (exam.status === "pending") {
                            actionLabel = "Pending approval";
                            disabled = true;
                            onClick = undefined;
                          } else if (alreadyDone) {
                            actionLabel = "Completed";
                            disabled = true;
                            onClick = undefined;
                          } else if (canResume) {
                            actionLabel = "Resume Exam";
                            onClick = () =>
                              handleStartExam(exam._id, attemptId);
                          } else if (canStart || exam.status === "approved") {
                            actionLabel = "Start Exam";
                            onClick = () => handleStartExam(exam._id);
                          }

                          return (
                            <tr
                              key={exam._id}
                              className="border-t border-border/50 text-sm"
                            >
                              <td className="px-3 py-2">{exam.title}</td>
                              <td className="px-3 py-2 capitalize">
                                {exam.beltLevel}
                              </td>
                              <td className="px-3 py-2 capitalize">
                                {exam.locked ? "locked" : exam.status}
                              </td>
                              <td className="px-3 py-2 capitalize">
                                {exam.locked
                                  ? `Locked (${exam.lessonsCompleted ?? 0}/${
                                      exam.lessonsRequired ?? 0
                                    } lessons)`
                                  : attemptStatus}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  className={`px-3 py-1 rounded text-white ${
                                    disabled
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-primary hover:bg-primary/90"
                                  }`}
                                  disabled={disabled}
                                  onClick={onClick}
                                >
                                  {actionLabel}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* RESULTS */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-muted-foreground">No results yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-border/50">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Exam Title
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Theory
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Practical
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Total
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Passed
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Certificate
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result) => {
                          const practicalScores =
                            result.finalPracticalScores || result.practicalScores;
                          let practical =
                            (practicalScores?.morality || 0) +
                              (practicalScores?.practicalMethod || 0) +
                              (practicalScores?.technique || 0) +
                              (practicalScores?.physical || 0) +
                              (practicalScores?.mental || 0) || 0;

                          const total =
                            result.finalTotalScore ??
                            practical +
                              (typeof result.theoryScore === "number"
                                ? result.theoryScore
                                : 0);
                          if (
                            (!practical || practical === 0) &&
                            typeof total === "number" &&
                            typeof result.theoryScore === "number"
                          ) {
                            practical = Math.max(
                              0,
                              total - (result.theoryScore || 0)
                            );
                          }

                          const passed =
                            typeof result.finalPassed === "boolean"
                              ? result.finalPassed
                              : result.passed;
                          const hasFinal =
                            typeof result.finalPassed === "boolean";
                          const examId = result.exam?._id || result.exam;
                          const cert = examId
                            ? certificateByExam[String(examId)]
                            : null;

                          return (
                            <tr
                              key={result._id}
                              className="border-t border-border/50 text-sm"
                            >
                              <td className="px-3 py-2">
                                {result.exam?.title || "Exam"}
                              </td>
                              <td className="px-3 py-2">
                                {result.theoryScore ?? 0}
                              </td>
                              <td className="px-3 py-2">
                                {hasFinal ? practical : "Pending"}
                              </td>
                              <td className="px-3 py-2">
                                {hasFinal ? total : "Pending"}
                              </td>
                              <td className="px-3 py-2">
                                {hasFinal ? (passed ? "Yes" : "No") : "Pending"}
                              </td>
                              <td className="px-3 py-2">
                                {cert ? (
                                  <button
                                    className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
                                    onClick={() =>
                                      examId && downloadCertificate(examId, user?._id)
                                    }
                                  >
                                    Download
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {result.submittedAt
                                  ? new Date(result.submittedAt).toLocaleString()
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* CERTIFICATES */}
          <TabsContent value="certs">
            <Card>
              <CardHeader>
                <CardTitle>My Certificates</CardTitle>
                <CardDescription>
                  View, verify & download your Silat certificates
                </CardDescription>
              </CardHeader>

              <CardContent>
                {certificates.length === 0 ? (
                  <p className="text-muted-foreground">
                    No certificates available yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-border/50">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Issue Date
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Belt Level
                          </th>
                          <th className="px-3 py-2 text-sm font-semibold">
                            Download
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificates.map((cert) => {
                          const issueDate = cert.issuedAt
                            ? new Date(cert.issuedAt).toLocaleDateString()
                            : "-";
                          const belt =
                            cert.exam?.beltLevel || cert.beltLevel || "-";
                          const examId = cert.exam?._id || cert.exam || cert.examId;
                          const studentId =
                            cert.student?._id || cert.student || user?._id;

                          return (
                            <tr key={cert._id} className="border-t border-border/50">
                              <td className="px-3 py-2 text-sm">{issueDate}</td>
                              <td className="px-3 py-2 text-sm capitalize">
                                {belt}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <button
                                  onClick={() =>
                                    examId && downloadCertificate(examId, studentId)
                                  }
                                  className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
                                >
                                  Download Certificate
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
