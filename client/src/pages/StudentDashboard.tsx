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
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------
     Fetch exams available for student
  --------------------------------------------- */
  const fetchAvailableExams = async () => {
    try {
      const res = await fetch(`${API}/exams/available/${beltLevel}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (Array.isArray(data.exams)) setAvailableExams(data.exams);
    } catch (err) {
      console.error("Fetch available exams error:", err);
    }
  };

  /* ---------------------------------------------
     Fetch student's exam results
  --------------------------------------------- */
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

  /* ---------------------------------------------
     Start exam
  --------------------------------------------- */
  const handleStartExam = async (examId: string) => {
    try {
      const res = await fetch(`${API}/exams/attempt/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Unable to start exam",
        });
        return;
      }

      toast({
        title: "Exam Started",
        description: "Redirecting to exam interface...",
      });

      window.location.href = `/exam/${examId}?attempt=${data.attemptId}`;
    } catch (err) {
      console.error("Start exam error:", err);
    }
  };

  /* ---------------------------------------------
     Load everything on mount
  --------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    Promise.all([fetchAvailableExams(), fetchResults()]).finally(() =>
      setLoading(false)
    );
  }, [token]);

  /* ---------------------------------------------
     Stats section
  --------------------------------------------- */
  const stats = [
    {
      title: "Current Belt",
      value: beltLevel.toUpperCase() + " Belt",
      icon: Award,
      color: "text-secondary",
    },
    {
      title: "Exams Passed",
      value: results.filter((r) => r.pass).length.toString(),
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

  /* ---------------------------------------------
     UI Render
  --------------------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl font-bold mb-2">
            Welcome back, <span className="text-primary">{studentName}</span>
          </h1>
          <p className="text-muted-foreground">
            Track your progress and continue your Silat journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="gradient-card shadow-card border-border/40 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* -------------------------- */}
          {/* Available Exams */}
          {/* -------------------------- */}
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
                    {availableExams.map((exam: any) => (
                      <ExamCard
                        key={exam._id}
                        exam={{
                          id: exam._id,
                          title: exam.title,
                          description: exam.description || "",
                          beltLevel: exam.beltLevel,
                          duration: exam.timeLimit || 20,
                          passingScore: exam.passingScore || 60,
                          totalQuestions: exam.questions?.length || 0,
                          type: "theory",
                        }}
                        onStart={handleStartExam}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------- */}
          {/* Results */}
          {/* -------------------------- */}
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
                    {results.map((result: any) => (
                      <ExamResultCard
                        key={result._id}
                        result={{
                          score: result.autoScore || 0,
                          totalQuestions: result.answers?.length || 1,
                          theoryScore: result.autoScore,
                          practicalScore: result.manualScore,
                          passed: result.pass,
                          completedAt: result.submittedAt,
                        }}
                        examTitle={result.exam?.title || "Exam"}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------- */}
          {/* Progress */}
          {/* -------------------------- */}
          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["white", "yellow", "blue", "brown", "red", "black"].map(
                    (belt) => (
                      <div key={belt}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full ${
                              beltLevel === belt
                                ? "bg-secondary/20 border-2 border-secondary"
                                : "bg-muted border-2 border-muted"
                            }`}
                          />
                          <span className="font-semibold">
                            {belt.toUpperCase()} Belt
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
