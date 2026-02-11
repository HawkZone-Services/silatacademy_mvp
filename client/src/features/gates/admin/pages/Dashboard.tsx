// ===============================
// IMPORTS
// ===============================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Navbar } from "@/shared/ui/Navbar";
import { Footer } from "@/shared/ui/Footer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import {
  Users,
  Calendar,
  CheckSquare,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";

import { AddPlayerDialog } from "@/features/players/components/admin/AddPlayerDialog";
import { AddLessonDialog } from "@/features/lessons/components/admin/AddLessonDialog";

import { RegistrationList } from "@/features/testing/components/admin/RegistrationList";
import { CreateExamDialog } from "@/features/testing/components/admin/CreateExamDialog";
import { PracticalScoreDialog } from "@/features/testing/components/admin/PracticalScoreDialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { SubmissionsList } from "@/features/testing/components/admin/SubmissionsList";
import { FinalizeResultButton } from "@/features/testing/components/admin/FinalizeResultButton";
import { CertificateGenerator } from "@/features/testing/components/admin/CertificateGenerator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

import adminService from "@/features/gates/admin/api/adminService";
import examService from "@/features/testing/api/examService";
import programService from "@/features/programs/api/programService";
import moduleService from "@/features/modules/api/moduleService";
import playerService from "@/features/players/api/playerService";
import { API_BASE_URL } from "@/shared/api/legacy/apiClient";

import { AddProgramDialog } from "@/features/programs/components/admin/AddProgramDialog";
import { AddModuleDialog } from "@/features/modules/components/admin/AddModuleDialog";
import { EditModuleDialog } from "@/features/modules/components/admin/EditModuleDialog";
import { EditProgramDialog } from "@/features/programs/components/admin/EditProgramDialog";
import CertificateCenter from "@/features/certificates/components/admin/CertificateCenter";
// components/ui/table.tsx
import * as React from "react";
import ApiPlayground from "@/features/testing/pages/ApiPlayground";
import PlayerScreen from "@/features/gates/admin/components/tabs/PlayersScreen";
import LessonsScreen from "@/features/gates/admin/components/tabs/LessonsScreen";
import ExamScreen from "@/features/gates/admin/components/tabs/ExamsScreen";
import ProgramsScreen from "@/features/gates/admin/components/tabs/ProgramsScreen";
import Module from "module";
import AnalyticsScreen from "@/features/gates/admin/components/tabs/AnalyticsScreen";
import AdminLessonsPage from "@/features/lessons/admin/pages/AdminLessonsPage";
import AttendanceScreen from "@/features/gates/admin/components/tabs/AttendanceScreen";
import AdminBeltRankingTab from "@/features/belt-ranking/pages/AdminBeltRankingTab";
import CoacheScreen from "@/features/gates/admin/components/tabs/CoacheScreen";
import ArticlesScreen from "@/features/gates/admin/components/tabs/ArticlesScreen";
import ModulesScreen from "@/features/modules/components/ModulesScreen";
import AdminAttendancePage from "@/features/attendance/pages/AdminAttendancePage";
import StudentAttendancePage from "@/features/attendance/pages/StudentAttendancePage";

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

  const [openExamId, setOpenExamId] = useState("");
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
      const [playersRes, lessonsRes, attendanceRes] = await Promise.all([
        adminService.getPlayers(),
        adminService.getLessons(),
        adminService.getAttendanceToday(),
      ]);

      const players = playersRes.data || [];
      const lessons = lessonsRes.data?.lessons || [];
      const attendance = attendanceRes.data?.attendance || [];

      setStats({
        totalPlayers: players.length,
        activePlayers: players.filter((p) => p.user?.isActive).length,
        upcomingLessons: lessons.length,
        todayAttendance: attendance.length,
      });

      setPlayers(players);
      setLessons(lessons);
    } catch (err) {
      console.error("Dashboard Data Error:", err);
    } finally {
      setLoading(false);
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

    fetchPrograms();
    fetchModules();
  }, [token]);

  useEffect(() => {
    setSelectedStudent("");
  }, []);

  /* ==========================================
     DERIVED DATA
  ========================================== */

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
                      (stats.todayAttendance / stats.activePlayers) * 100,
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
            <TabsTrigger value="coachs">Coaches</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="belt-ranking">Belt Rankings</TabsTrigger>{" "}
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="api-playground">APIs</TabsTrigger>
            <TabsTrigger value="attendance-v2">test Attendance</TabsTrigger>
          </TabsList>

          {/* PLAYERS */}
          <TabsContent value="players">
            <PlayerScreen
              fetchDashboardData={fetchDashboardData}
              token={token}
            />
          </TabsContent>
          {/* COACHS */}
          <TabsContent value="coachs">
            <CoacheScreen token={token} />
          </TabsContent>

          {/* TESTING TAB */}
          <TabsContent value="testing">
            <ExamScreen token={token} />
          </TabsContent>

          {/* LESSONS */}
          <TabsContent value="lessons">
            <AdminLessonsPage />
          </TabsContent>

          {/* PROGRAMS MANAGEMENT */}
          <TabsContent value="programs">
            <ProgramsScreen />
          </TabsContent>
          {/* MODULES MANAGEMENT */}
          <TabsContent value="modules">
            <ModulesScreen />
          </TabsContent>
          {/* CERTIFICATES MANAGEMENT */}
          <TabsContent value="certificates">
            <CertificateCenter />
          </TabsContent>
          {/* ANALYTICS */}
          <TabsContent value="analytics">
            <AnalyticsScreen />
          </TabsContent>
          {/* ATTENDANCE */}
          <TabsContent value="attendance">
            <AttendanceScreen />
          </TabsContent>
          {/* BELT RANKINGS */}
          <TabsContent value="belt-ranking" className="space-y-4">
            <AdminBeltRankingTab />
          </TabsContent>
          {/* Articles */}
          <TabsContent value="articles">
            <ArticlesScreen />
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
          {/* Attendance v2 */}
          <TabsContent value="attendance-v2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance v2</CardTitle>
                <CardDescription>
                  Test API endpoints directly from the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentAttendancePage />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
