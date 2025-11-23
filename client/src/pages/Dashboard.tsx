// ===============================
// IMPORTS
// ===============================
import { useEffect, useState } from "react";
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

import { Users, Calendar, CheckSquare, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { AddPlayerDialog } from "@/components/admin/AddPlayerDialog";
import { AddLessonDialog } from "@/components/admin/AddLessonDialog";
import { AttendanceTracker } from "@/components/admin/AttendanceTracker";

import { RegistrationList } from "@/components/admin/test/RegistrationList";
import { CreateExamDialog } from "@/components/admin/test/CreateExamDialog";
import { PracticalScoreDialog } from "@/components/admin/test/PracticalScoreDialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SubmissionsList } from "@/components/admin/test/SubmissionsList";
import { FinalizeResultButton } from "@/components/admin/test/FinalizeResultButton";
import { CertificateGenerator } from "@/components/admin/test/CertificateGenerator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // UPDATED API ROUTES
  const ADMIN_API = "https://api-f3rwhuz64a-uc.a.run.app/api/admin";
  const EXAM_API = "https://api-f3rwhuz64a-uc.a.run.app/api/exams";

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // ==========================================
  // Dashboard State
  // ==========================================
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    upcomingLessons: 0,
    todayAttendance: 0,
  });

  const [players, setPlayers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openExamId, setOpenExamId] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // ==========================================
  // AUTH
  // ==========================================
  const checkAuth = () => {
    const savedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !savedUser) {
      navigate("/login");
    }
  };

  // ==========================================
  // JSON PARSER
  // ==========================================
  const safeJSON = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ==========================================
  // Fetch dashboard data
  // ==========================================
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await fetch(`${ADMIN_API}/dashboard`, { headers });
      const statsJson = (await safeJSON(statsRes)) || {};

      const playersRes = await fetch(`${ADMIN_API}/players`, { headers });
      const playersJson = (await safeJSON(playersRes)) || [];

      const lessonsRes = await fetch(`${ADMIN_API}/lessons`, { headers });
      const lessonsJson =
        (await safeJSON(lessonsRes))?.lessons ||
        (await safeJSON(lessonsRes)) ||
        [];

      const attendanceRes = await fetch(`${ADMIN_API}/attendance/today`, {
        headers,
      });
      const attendanceJson = (await safeJSON(attendanceRes)) || [];

      setStats({
        totalPlayers: statsJson.totalPlayers || playersJson.length || 0,
        activePlayers:
          playersJson.filter((p: any) => p.status === "active")?.length || 0,
        upcomingLessons: lessonsJson.length || 0,
        todayAttendance: attendanceJson.length || 0,
      });

      setPlayers(playersJson);
      setLessons(lessonsJson);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Fetch Exams (Admin)
  // ==========================================
  const fetchExams = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(`${EXAM_API}`, { headers });
      const data = await safeJSON(res);

      const list = data?.exams || [];
      setExams(list);

      if (!selectedExam && list.length > 0) {
        setSelectedExam(list[0]._id);
      }
    } catch (error) {
      console.error("Fetch Exams Error:", error);
    }
  };

  // ==========================================
  // Fetch registrations (ADMIN) for selectedExam
  // ==========================================
  const fetchRegistrations = async () => {
    try {
      if (!selectedExam) {
        setRegistrations([]);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(
        `${EXAM_API}/admin/registrations/${selectedExam}`,
        {
          headers,
        }
      );
      const data = await safeJSON(res);

      setRegistrations(
        Array.isArray(data?.registrations) ? data.registrations : []
      );
    } catch (error) {
      console.error("Fetch registrations error:", error);
      setRegistrations([]);
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (!selectedExam) {
        setSubmissions([]);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(`${EXAM_API}/admin/submissions/${selectedExam}`, {
        headers,
      });

      const data = await safeJSON(res);

      setSubmissions(Array.isArray(data?.submissions) ? data.submissions : []);
    } catch (error) {
      console.error("Fetch submissions error:", error);
      setSubmissions([]);
    }
  };

  // ==========================================
  // RUN ON LOAD
  // ==========================================
  useEffect(() => {
    checkAuth();
    fetchDashboardData();
    fetchExams();
  }, [token]);

  useEffect(() => {
    fetchRegistrations();
    fetchSubmissions();
    setSelectedStudent("");
  }, [selectedExam]);

  // ==========================================
  // Approve / Reject registration
  // ==========================================
  const approveFn = async (regId: string) => {
    const headers = { Authorization: `Bearer ${token}` };

    await fetch(`${EXAM_API}/admin/registration/${regId}/approve`, {
      method: "PATCH",
      headers,
    });

    fetchRegistrations();
  };

  const rejectFn = async (regId: string) => {
    const headers = { Authorization: `Bearer ${token}` };

    await fetch(`${EXAM_API}/admin/registration/${regId}/reject`, {
      method: "PATCH",
      headers,
    });

    fetchRegistrations();
  };

  // ==========================================
  // PLAYER FILTER
  // ==========================================
  const filteredPlayers = players.filter((player: any) => {
    const q = searchQuery.toLowerCase();
    return (
      player.name?.toLowerCase().includes(q) ||
      player.email?.toLowerCase().includes(q) ||
      player.national_id?.toLowerCase().includes(q)
    );
  });

  const finalizedSubmissions = submissions.filter((s: any) => s?.finalPassed);
  const pendingSubmissions = submissions.filter((s: any) => !s?.finalPassed);
  const CERT_API = "https://api-f3rwhuz64a-uc.a.run.app/api/certificates";

  const publishExamAdmin = async (examId: string) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      await fetch(`${EXAM_API}/admin/${examId}/publish`, {
        method: "PATCH",
        headers,
      });
      fetchExams();
    } catch (err) {
      console.error("Publish exam error:", err);
    }
  };
  const finalized = submissions.filter((s: any) => s.finalPassed);
  const pending = submissions.filter((s: any) => !s.finalPassed);

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Academy Dashboard</h1>
          <p className="text-muted-foreground">
            Manage players, lessons, attendance & exams
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Players
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePlayers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Lessons
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingLessons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Attendance
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Activity Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activePlayers > 0
                  ? Math.round(
                      (stats.todayAttendance / stats.activePlayers) * 100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* PLAYERS */}
          <TabsContent value="players">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Player Management</CardTitle>
                    <CardDescription>Manage academy players</CardDescription>
                  </div>
                  <AddPlayerDialog onPlayerAdded={fetchDashboardData} />
                </div>
              </CardHeader>

              <CardContent>
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredPlayers.map((player: any) => (
                    <div
                      key={player._id}
                      className="flex items-center justify-between p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition"
                    >
                      <div>
                        <h4 className="font-semibold">{player.name}</h4>

                        <p className="text-sm">{player.email}</p>

                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">
                            {player.beltLevel || "white"}
                          </Badge>

                          <Badge variant="secondary">
                            {player.status || "active"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/player/${player._id}?mode=cert`)
                          }
                        >
                          Generate Cert
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/player/${player._id}?mode=view`)
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TESTING TAB */}
          <TabsContent value="testing">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Exams</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage exams, registrations, submissions, and certificates.
                  </p>
                </div>
                <CreateExamDialog onCreated={fetchExams} />
              </div>

              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Exam Title</th>
                      <th className="px-3 py-2 text-sm font-semibold">Belt Level</th>
                      <th className="px-3 py-2 text-sm font-semibold">Exam Date</th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Registrations
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">Submissions</th>
                      <th className="px-3 py-2 text-sm font-semibold">Status</th>
                      <th className="px-3 py-2 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam: any) => {
                      const isOpen = openExamId === exam._id;
                      const regCount = registrations.filter(
                        (r: any) => r.exam?.toString() === exam._id
                      ).length;
                      const subCount = submissions.filter(
                        (s: any) =>
                          s.exam?.toString() === exam._id && !s.finalPassed
                      ).length;
                      const examDate =
                        exam.schedule?.startsAt ||
                        exam.schedule?.date ||
                        exam.createdAt ||
                        "";
                      const formattedDate = examDate
                        ? new Date(examDate).toLocaleDateString()
                        : "-";

                      const toggleOpen = (next: boolean) => {
                        const val = next ? exam._id : "";
                        setOpenExamId(val);
                        setSelectedStudent("");
                        if (next) {
                          setSelectedExam(exam._id);
                        } else {
                          setSelectedExam("");
                        }
                      };

                      return (
                        <tr
                          key={exam._id}
                          className="border-t border-border/50 text-sm align-top"
                        >
                          <td className="px-3 py-2">{exam.title}</td>
                          <td className="px-3 py-2 capitalize">
                            {exam.beltLevel || "-"}
                          </td>
                          <td className="px-3 py-2">{formattedDate}</td>
                          <td className="px-3 py-2">{regCount}</td>
                          <td className="px-3 py-2">{subCount}</td>
                          <td className="px-3 py-2 capitalize">
                            {exam.status || "unpublished"}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleOpen(!isOpen)}
                              >
                                {isOpen ? "Collapse" : "Expand"}
                              </Button>
                              {exam.status !== "published" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => publishExamAdmin(exam._id)}
                                >
                                  Publish
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" disabled>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Accordion
                type="single"
                collapsible
                value={openExamId}
                onValueChange={(val) => {
                  setOpenExamId(val);
                  if (val) setSelectedExam(val);
                }}
                className="space-y-3"
              >
                {exams.map((exam: any) => {
                  const examPendingSubs = submissions.filter(
                    (s: any) => s.exam?.toString() === exam._id
                  );
                  const examFinalizedSubs = finalizedSubmissions.filter(
                    (s: any) => s.exam?.toString() === exam._id
                  );
                  const activeRegistrations = registrations.filter(
                    (r: any) => !r.finalPassed && r.exam?.toString() === exam._id
                  );
                  const selectedSubmission = examPendingSubs.find((s: any) => {
                    const studentId =
                      typeof s.student === "object" ? s.student?._id : s.student;
                    const examId =
                      typeof s.exam === "object" ? s.exam?._id : s.exam;
                    return (
                      String(examId) === String(selectedExam) &&
                      String(studentId) === String(selectedStudent)
                    );
                  });

                  return (
                    <AccordionItem key={exam._id} value={exam._id} className="border">
                      <AccordionTrigger className="px-4 py-2 text-left">
                        <div>
                          <p className="font-semibold">{exam.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {exam.beltLevel || "-"} • {exam.status || "unpublished"}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-4 space-y-6">
                        {/* Registration Management (pending only) */}
                        <section className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              Exam Registrations
                            </h3>
                              <Select
                              value={selectedExam}
                              onValueChange={(val) => {
                                setSelectedExam(val);
                                setOpenExamId(val);
                                setSelectedStudent("");
                              }}
                            >
                              <SelectTrigger className="w-60">
                                <SelectValue placeholder="Select Exam" />
                              </SelectTrigger>
                              <SelectContent>
                                {exams.map((e) => (
                                  <SelectItem key={e._id} value={e._id}>
                                    {e.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <RegistrationList
                            list={activeRegistrations}
                            onApprove={approveFn}
                            onReject={rejectFn}
                          />
                        </section>

                        {/* Submissions (all) */}
                        <section className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Exam Submissions</h3>
                            <p className="text-sm text-muted-foreground">
                              Select a submission to score and finalize.
                            </p>
                          </div>
                          <SubmissionsList
                            list={examPendingSubs}
                            onSelect={(studentId, examId) => {
                              setSelectedStudent(studentId);
                              setSelectedExam(examId);
                              setOpenExamId(examId);
                            }}
                          />
                        </section>

                        {/* Practical Scoring & Finalization */}
                        {selectedSubmission && (
                          <section className="space-y-3">
                            <h3 className="text-lg font-semibold">
                              Practical Evaluation
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <PracticalScoreDialog
                                studentId={selectedStudent}
                                examId={selectedExam}
                                finalPassed={selectedSubmission.finalPassed}
                                practicalRecorded={
                                  selectedSubmission.practicalRecorded
                                }
                                onSaved={() => {
                                  fetchSubmissions();
                                }}
                              />

                              <FinalizeResultButton
                                studentId={selectedStudent}
                                examId={selectedExam}
                                finalPassed={selectedSubmission.finalPassed}
                                onFinalized={() => {
                                  fetchSubmissions();
                                }}
                              />

                              <CertificateGenerator
                                studentId={selectedStudent}
                                examId={selectedExam}
                                finalPassed={selectedSubmission.finalPassed}
                              />
                            </div>
                          </section>
                        )}

                        {/* Finalized Certificates for this exam */}
                        {examFinalizedSubs.length > 0 && (
                          <section className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              Finalized Certificates
                            </h3>
                            <div className="overflow-x-auto border border-border/50 rounded-lg">
                              <table className="w-full text-left">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="px-3 py-2 text-sm font-semibold">
                                      Student
                                    </th>
                                    <th className="px-3 py-2 text-sm font-semibold">
                                      Belt Level
                                    </th>
                                    <th className="px-3 py-2 text-sm font-semibold">
                                      Date
                                    </th>
                                    <th className="px-3 py-2 text-sm font-semibold">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {examFinalizedSubs.map((s: any) => {
                                    const issueDate = s.finalizedAt
                                      ? new Date(s.finalizedAt).toLocaleDateString()
                                      : "-";
                                    const belt = s.exam?.beltLevel || "-";

                                    const handlePrint = () => {
                                      const examId =
                                        typeof s.exam === "object" ? s.exam?._id : s.exam;
                                      const studentId =
                                        typeof s.student === "object"
                                          ? s.student?._id
                                          : s.student;
                                      if (examId && studentId) {
                                        window.open(
                                          `${CERT_API}/admin/pdf/${examId}/${studentId}`,
                                          "_blank"
                                        );
                                      }
                                    };

                                    return (
                                      <tr
                                        key={s._id}
                                        className="border-t border-border/50 text-sm"
                                      >
                                        <td className="px-3 py-2">
                                          {s.student?.name || "Student"}
                                        </td>
                                        <td className="px-3 py-2 capitalize">{belt}</td>
                                        <td className="px-3 py-2">{issueDate}</td>
                                        <td className="px-3 py-2">
                                          <button
                                            onClick={handlePrint}
                                            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
                                          >
                                            Print Certificate
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </section>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </TabsContent>

          {/* LESSONS */}
          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lesson Schedule</CardTitle>
                    <CardDescription>Manage training sessions</CardDescription>
                  </div>
                  <AddLessonDialog onLessonAdded={fetchDashboardData} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {Array.isArray(lessons) &&
                    lessons.map((lesson: any) => (
                      <div
                        key={lesson._id}
                        className="p-4 bg-accent/10 rounded-lg"
                      >
                        <h4 className="font-semibold">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lesson.date
                            ? new Date(lesson.date).toLocaleDateString()
                            : "N/A"}{" "}
                          • {lesson.start_time || "??"} -{" "}
                          {lesson.end_time || "??"}
                        </p>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {lesson.type || "general"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ATTENDANCE */}
          <TabsContent value="attendance">
            <AttendanceTracker />
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>Coming soon…</CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
