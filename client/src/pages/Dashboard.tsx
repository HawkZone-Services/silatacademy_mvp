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

import {
  Users,
  Calendar,
  CheckSquare,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { AddPlayerDialog } from "@/components/admin/AddPlayerDialog";
import { AddLessonDialog } from "@/components/admin/AddLessonDialog";

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

import adminService from "@/services/adminService";
import examService from "@/services/examService";
import programService from "@/services/programService";
import moduleService from "@/services/moduleService";
import playerService from "@/services/playerService";
import { API_BASE_URL } from "@/lib/apiClient";

import { AddProgramDialog } from "@/components/admin/AddProgramDialog";
import { AddModuleDialog } from "@/components/admin/AddModuleDialog";
import { EditModuleDialog } from "@/components/admin/EditModuleDialog";
import { EditProgramDialog } from "@/components/admin/EditProgramDialog";
import CertificateCenter from "@/components/admin/certificates/CertificateCenter";
// components/ui/table.tsx
import * as React from "react";
import ApiPlayground from "./ApiPlayground";

export const Table = ({ ...props }) => (
  <table className="w-full text-sm text-left" {...props} />
);

export const TableHeader = ({ ...props }) => (
  <thead className="bg-muted" {...props} />
);

export const TableBody = ({ ...props }) => <tbody {...props} />;

export const TableRow = ({ ...props }) => (
  <tr className="border-t border-border/50" {...props} />
);

export const TableHead = ({ ...props }) => (
  <th className="px-3 py-2 font-semibold text-sm" {...props} />
);

export const TableCell = ({ ...props }) => (
  <td className="px-3 py-2 align-top" {...props} />
);

export default function Dashboard() {
  const navigate = useNavigate();

  /* ==========================================
     AUTH
  ========================================== */
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const checkAuth = () => {
    const savedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !savedUser) navigate("/login");
  };

  /* ==========================================
     GLOBAL STATE
  ========================================== */
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    upcomingLessons: 0,
    todayAttendance: 0,
  });

  const [players, setPlayers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [openExamId, setOpenExamId] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  // Programs / Modules
  const [programs, setPrograms] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [editProgramOpen, setEditProgramOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<any | null>(null);

  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [editModule, setEditModule] = useState<any | null>(null);

  /* ==========================================
     FETCHERS
  ========================================== */

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      /* PLAYERS */
      const playersRes = await playerService.getAllPlayers();
      const playerPayload =
        playersRes?.data?.players ||
        playersRes?.data ||
        playersRes?.players ||
        playersRes;
      const playerList = Array.isArray(playerPayload) ? playerPayload : [];

      /* LESSONS */
      const lessonsRes = await adminService.getLessons();
      const lessonsPayload =
        lessonsRes?.data?.lessons || lessonsRes?.lessons || lessonsRes?.data;
      const lessonsList = Array.isArray(lessonsPayload) ? lessonsPayload : [];

      /* ATTENDANCE */
      const attendanceRes = await adminService.getAttendanceToday();
      const attendancePayload =
        attendanceRes?.data?.attendance ||
        attendanceRes?.attendance ||
        attendanceRes?.data ||
        attendanceRes;
      const attendanceList = Array.isArray(attendancePayload)
        ? attendancePayload
        : [];

      /* STATS */
      setStats({
        totalPlayers: playerList.length,
        activePlayers: playerList.filter((p) => p.status === "active").length,
        upcomingLessons: lessonsList.length,
        todayAttendance: attendanceList.length,
      });

      setPlayers(playerList);
      setLessons(lessonsList);
    } catch (err) {
      console.error("Dashboard Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await examService.getAllExams();

      const list = Array.isArray(res?.exams)
        ? res.exams
        : Array.isArray(res)
        ? res
        : [];

      setExams(list);

      if (!selectedExam && list.length > 0) {
        setSelectedExam(list[0]._id);
      }
    } catch (err) {
      console.error("Fetch Exams Error:", err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      if (!selectedExam) return setRegistrations([]);

      const res = await examService.getAdminRegistrations(selectedExam);
      const list = Array.isArray(res?.registrations) ? res.registrations : [];

      setRegistrations(list);
    } catch (err) {
      console.error("Fetch Registrations Error:", err);
      setRegistrations([]);
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (!selectedExam) return setSubmissions([]);

      const res = await examService.getAdminSubmissions(selectedExam);
      const list = Array.isArray(res?.submissions) ? res.submissions : [];

      setSubmissions(list);
    } catch (err) {
      console.error("Fetch Submissions Error:", err);
      setSubmissions([]);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await programService.getPrograms();

      const list = Array.isArray(res?.programs)
        ? res.programs
        : Array.isArray(res)
        ? res
        : [];

      setPrograms(list);
    } catch (err) {
      console.error("Fetch Programs Error:", err);
      setPrograms([]);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await moduleService.getModules();

      const list = Array.isArray(res?.modules)
        ? res.modules
        : Array.isArray(res)
        ? res
        : [];

      setModules(list);
    } catch (err) {
      console.error("Fetch Modules Error:", err);
      setModules([]);
    }
  };

  /* ==========================================
     ACTIONS
  ========================================== */

  const approveFn = async (id: string) => {
    await examService.approveRegistration(id);
    fetchRegistrations();
  };

  const rejectFn = async (id: string) => {
    await examService.rejectRegistration(id);
    fetchRegistrations();
  };

  const publishExamAdmin = async (id: string) => {
    try {
      await examService.publishExam(id);
      fetchExams();
    } catch (err) {
      console.error("Publish Exam Error:", err);
    }
  };

  const handleEditProgram = (program: any) => {
    setEditProgram(program);
    setEditProgramOpen(true);
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Delete program?")) return;
    await programService.deleteProgram(id);
    fetchPrograms();
  };

  const handleEditModule = (module: any) => {
    setEditModule(module);
    setEditModuleOpen(true);
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Delete module?")) return;
    await moduleService.deleteModule(id);
    fetchModules();
  };

  /* ==========================================
     EFFECTS
  ========================================== */

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
    fetchExams();
    fetchPrograms();
    fetchModules();
  }, [token]);

  useEffect(() => {
    fetchRegistrations();
    fetchSubmissions();
    setSelectedStudent("");
  }, [selectedExam]);

  /* ==========================================
     DERIVED DATA
  ========================================== */

  const filteredPlayers = players.filter((player) => {
    const q = searchQuery.toLowerCase();
    return (
      player.name?.toLowerCase().includes(q) ||
      player.email?.toLowerCase().includes(q) ||
      player.national_id?.toLowerCase().includes(q)
    );
  });

  const finalizedSubmissions = submissions.filter((s) => s?.finalPassed);

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
            Manage players, lessons, attendance, programs & exams
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
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="api-playground">APIs</TabsTrigger>
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
                      <th className="px-3 py-2 text-sm font-semibold">
                        Exam Title
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Belt Level
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Exam Date
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Registrations
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Submissions
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-3 py-2 text-sm font-semibold">
                        Actions
                      </th>
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
                    (r: any) =>
                      !r.finalPassed && r.exam?.toString() === exam._id
                  );
                  const selectedSubmission = examPendingSubs.find((s: any) => {
                    const studentId =
                      typeof s.student === "object"
                        ? s.student?._id
                        : s.student;
                    const examId =
                      typeof s.exam === "object" ? s.exam?._id : s.exam;
                    return (
                      String(examId) === String(selectedExam) &&
                      String(studentId) === String(selectedStudent)
                    );
                  });

                  return (
                    <AccordionItem
                      key={exam._id}
                      value={exam._id}
                      className="border"
                    >
                      <AccordionTrigger className="px-4 py-2 text-left">
                        <div>
                          <p className="font-semibold">{exam.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {exam.beltLevel || "-"} •{" "}
                            {exam.status || "unpublished"}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-4 space-y-6">
                        {/* Registration Management */}
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

                        {/* Submissions */}
                        <section className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              Exam Submissions
                            </h3>
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
                                onSaved={fetchSubmissions}
                              />

                              <FinalizeResultButton
                                studentId={selectedStudent}
                                examId={selectedExam}
                                finalPassed={selectedSubmission.finalPassed}
                                onFinalized={fetchSubmissions}
                              />

                              <CertificateGenerator
                                studentId={selectedStudent}
                                examId={selectedExam}
                                finalPassed={selectedSubmission.finalPassed}
                              />
                            </div>
                          </section>
                        )}

                        {/* Finalized Certificates */}
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
                                      ? new Date(
                                          s.finalizedAt
                                        ).toLocaleDateString()
                                      : "-";
                                    const belt = s.exam?.beltLevel || "-";

                                    const handlePrint = () => {
                                      const examId =
                                        typeof s.exam === "object"
                                          ? s.exam?._id
                                          : s.exam;
                                      const studentId =
                                        typeof s.student === "object"
                                          ? s.student?._id
                                          : s.student;
                                      if (examId && studentId) {
                                        window.open(
                                          `${API_BASE_URL}/certificates/admin/pdf/${examId}/${studentId}`,
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
                                        <td className="px-3 py-2 capitalize">
                                          {belt}
                                        </td>
                                        <td className="px-3 py-2">
                                          {issueDate}
                                        </td>
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
                    <CardTitle>Lessons</CardTitle>
                    <CardDescription>
                      Manage all scheduled lessons
                    </CardDescription>
                  </div>
                  <AddLessonDialog onLessonAdded={fetchDashboardData} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto border border-border/40 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {lessons.map((lesson: any) => (
                        <TableRow key={lesson._id}>
                          <TableCell>{lesson.title}</TableCell>
                          <TableCell>
                            {lesson.date
                              ? new Date(lesson.date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {lesson.start_time || "??"} -{" "}
                            {lesson.end_time || "??"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {lesson.type || "general"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROGRAMS MANAGEMENT */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Programs</CardTitle>
                    <CardDescription>
                      Training program structure
                    </CardDescription>
                  </div>
                  <AddProgramDialog onProgramAdded={fetchPrograms} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto border border-border/40 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {programs.map((program: any) => (
                        <TableRow key={program._id}>
                          <TableCell className="font-medium">
                            {program.title}
                          </TableCell>
                          <TableCell>{program.description}</TableCell>
                          <TableCell>{program.duration}</TableCell>
                          <TableCell>{program.targetAudience}</TableCell>
                          <TableCell>{program.classSchedule}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProgram(program)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProgram(program._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {editProgram && (
                  <EditProgramDialog
                    open={editProgramOpen}
                    setOpen={setEditProgramOpen}
                    program={editProgram}
                    onUpdated={fetchPrograms}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODULES MANAGEMENT */}
          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Modules</CardTitle>
                    <CardDescription>
                      Learning modules inside programs
                    </CardDescription>
                  </div>
                  <AddModuleDialog onModuleAdded={fetchModules} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto border border-border/40 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Topics</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {modules.map((m: any) => (
                        <TableRow key={m._id}>
                          <TableCell className="font-medium">
                            {m.title}
                          </TableCell>
                          <TableCell>
                            {m.program?.title || m.programTitle}
                          </TableCell>
                          <TableCell>
                            <ul className="list-disc ml-4 space-y-1">
                              {m.topics?.map((t: string, i: number) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditModule(m)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteModule(m._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {editModule && (
                  <EditModuleDialog
                    open={editModuleOpen}
                    setOpen={setEditModuleOpen}
                    moduleData={editModule}
                    onUpdated={fetchModules}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* CERTIFICATES MANAGEMENT */}
          <TabsContent value="certificates">
            <CertificateCenter />
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
          {/* API PLAYGROUND */}
          <TabsContent value="api-playground">
            <Card>
              <CardHeader>
                <CardTitle>API Playground</CardTitle>
                <CardDescription>
                  Test API endpoints directly from the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiPlayground />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
