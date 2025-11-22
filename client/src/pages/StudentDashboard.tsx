// ===============================
// Student Dashboard (FINAL VERSION)
// ===============================

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { ExamCard } from "@/components/exam/ExamCard";
import { ExamResultCard } from "@/components/exam/ExamResultCard";

import { Calendar, Trophy, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { StudentCertificateCard } from "@/components/exam/StudentCertificateCard";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function StudentDashboard() {
  const { toast } = useToast();

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

  // =======================
  // AUTO-REFRESH CERTIFICATES
  // =======================
  useEffect(() => {
    if (localStorage.getItem("refreshCertificates") === "1") {
      fetchCertificates();
      localStorage.removeItem("refreshCertificates");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCertificates();
    }, 10000); // كل 10 ثواني تحديث الشهادات تلقائياً

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // Fetch Results FIRST
  // ===============================
  const fetchResults = async () => {
    try {
      const res = await fetch(`${API}/exams/my-attempts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data.attempts)) {
        setResults(data.attempts);
      }
    } catch (err) {
      console.error("Fetch results error:", err);
    }
  };

  // ===============================
  // Exam Registration Status
  // ===============================
  const getExamStatus = async (examId: string) => {
    try {
      const res = await fetch(`${API}/exams/registration/status/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      return data.status || "none";
    } catch {
      return "none";
    }
  };

  // ===============================
  // Fetch Available Exams
  // ===============================
  const fetchAvailableExams = async () => {
    try {
      const res = await fetch(`${API}/exams/available/${beltLevel}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!Array.isArray(data.exams)) return;

      const examsWithStatus = await Promise.all(
        data.exams.map(async (exam: any) => {
          const status = await getExamStatus(exam._id);

          const passMark = exam.passMark ?? 0;
          const maxTheoryScore = exam.maxTheoryScore ?? 40;
          const passPercent =
            maxTheoryScore > 0
              ? Math.round((passMark / maxTheoryScore) * 100)
              : passMark;

          const attempt = results.find((r) => r.exam?._id === exam._id);
          const attemptStatus = attempt ? "completed" : "notAttempted";

          return { ...exam, status, passPercent, attemptStatus };
        })
      );

      setAvailableExams(examsWithStatus);
    } catch (err) {
      console.error("Fetch available exams error:", err);
    }
  };

  // ===============================
  // Fetch Certificates
  // ===============================
  const fetchCertificates = async () => {
    try {
      const res = await fetch(`${API}/certificates/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (Array.isArray(data.certificates)) {
        setCertificates(data.certificates);
      }
    } catch (err) {
      console.error("Certificate fetch error:", err);
    }
  };

  // ===============================
  // Register for Exam
  // ===============================
  const handleRegister = async (examId: string) => {
    try {
      const res = await fetch(`${API}/exams/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId,
          playerId: user._id,
        }),
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

      fetchAvailableExams();
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  // ===============================
  // Start Exam
  // ===============================
  const handleStartExam = async (examId: string) => {
    const already = results.find((r) => r.exam?._id === examId);
    if (already) {
      toast({
        variant: "destructive",
        title: "Exam Already Completed",
        description: "You cannot retake this exam.",
      });
      return;
    }

    try {
      const res = await fetch(`${API}/exams/attempt/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId }),
      });

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
  // Page Load Logic (Correct Order)
  // ===============================
  useEffect(() => {
    if (!token) return;

    (async () => {
      await fetchResults();
      await fetchAvailableExams();
      await fetchCertificates();
      setLoading(false);
    })();
  }, [token]);

  // ===============================
  // Auto Refresh Every 20 Seconds
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResults();
      fetchAvailableExams();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // One-time refresh after exam submission
  // ===============================
  useEffect(() => {
    if (localStorage.getItem("refreshResults") === "1") {
      fetchResults();
      fetchAvailableExams();
      localStorage.removeItem("refreshResults");
    }
  }, []);

  // ===============================
  // Stats
  // ===============================
  const stats = [
    {
      title: "Current Belt",
      value: beltLevel.toUpperCase() + " Belt",
      icon: Award,
      color: "text-secondary",
    },
    {
      title: "Exams Passed",
      value: results.filter((r) => r.passed).length.toString(),
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
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            Welcome back, <span className="text-primary">{studentName}</span>
          </h1>
          <p className="text-muted-foreground">
            Track your progress and continue your Silat journey
          </p>
        </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableExams.map((exam) => (
                      <ExamCard
                        key={exam._id}
                        exam={{
                          id: exam._id,
                          title: exam.title,
                          description: exam.description || "",
                          beltLevel: exam.beltLevel,
                          duration: exam.timeLimit || 20,
                          passingScore: exam.passPercent,
                          totalQuestions: exam.questions?.length || 0,
                          type: "theory",
                          status: exam.status,
                          attemptStatus: exam.attemptStatus,
                        }}
                        onRegister={handleRegister}
                        onStart={handleStartExam}
                      />
                    ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result) => {
                      const practical =
                        (result.practicalScores?.morality || 0) +
                          (result.practicalScores?.practicalMethod || 0) +
                          (result.practicalScores?.technique || 0) +
                          (result.practicalScores?.physical || 0) +
                          (result.practicalScores?.mental || 0) || 0;

                      return (
                        <ExamResultCard
                          key={result._id}
                          result={{
                            theoryScore: result.theoryScore ?? 0,
                            practicalScore: practical,
                            passed: result.passed,
                            completedAt: result.submittedAt,
                            exam: {
                              maxTheoryScore: result.exam?.maxTheoryScore || 40,
                            },
                          }}
                          examTitle={result.exam?.title || "Exam"}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          // ======================= // CERTIFICATES TAB (FULL PATCH) //
          =======================
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
                  <div className="space-y-12">
                    {certificates.map((cert) => (
                      <StudentCertificateCard
                        key={cert._id}
                        certificate={cert}
                        studentName={studentName}
                      />
                    ))}
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
