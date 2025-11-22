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
import { ExamList } from "@/components/admin/test/ExamList";
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
            <div className="space-y-10">
              {/* Create Exam */}
              <section>
                <CreateExamDialog onCreated={fetchExams} />
              </section>

              {/* Exam List */}
              <section>
                <h2 className="text-xl font-bold mt-6 mb-2">Exams List</h2>
                <ExamList exams={exams} onRefresh={fetchExams} />
              </section>

              {/* Registration Management */}
              <section>
                <h2 className="text-xl font-bold mt-6 mb-2">
                  Exam Registrations
                </h2>

                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam._id} value={exam._id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <RegistrationList
                  list={registrations}
                  onApprove={approveFn}
                  onReject={rejectFn}
                />
              </section>

              {/* Exam Submissions */}
              <section>
                <h2 className="text-xl font-bold mt-6 mb-2">
                  Exam Submissions
                </h2>

                <SubmissionsList
                  list={submissions}
                  onSelect={(studentId, examId) => {
                    setSelectedStudent(studentId);
                    setSelectedExam(examId);
                  }}
                />
              </section>

              {/* Practical Scoring */}
              <section>
                <h2 className="text-xl font-bold mt-6 mb-2">
                  Practical Evaluation
                </h2>

                <PracticalScoreDialog
                  studentId={selectedStudent}
                  examId={selectedExam}
                  onSaved={() => {
                    fetchSubmissions();
                  }}
                />

                <FinalizeResultButton
                  studentId={selectedStudent}
                  examId={selectedExam}
                  onFinalized={() => {
                    fetchSubmissions();
                  }}
                />

                <CertificateGenerator
                  studentId={selectedStudent}
                  examId={selectedExam}
                />
              </section>
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
