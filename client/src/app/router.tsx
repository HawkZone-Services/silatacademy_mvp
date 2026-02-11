// src/routes/appRoutes.ts
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

// Pages
import Index from "@/features/support/pages/Main";
import PlayerProfile from "@/features/players/pages/PlayerProfile";
import Rankings from "@/features/belt-ranking/pages/Rankings";
import Programs from "@/features/programs/pages/Programs";
import Coaches from "@/features/coaches/pages/Coaches";
import NotFound from "@/features/support/pages/NotFound";
import Admin from "@/features/gates/admin/pages/Admin";
import Library from "@/features/articles/pages/Library";
import ArticlePage from "@/features/articles/pages/ArticlePage";
import Signup from "@/features/auth/pages/Signup";
import Login from "@/features/auth/pages/Login";
import ExamInterface from "@/features/testing/pages/ExamInterface";
import SilatHistory from "@/features/support/pages/SilatHistory";
import Events from "@/features/support/pages/Events";
import StudentDashboard from "@/features/gates/player/pages/StudentDashboard";
import InstructorDashboard from "@/features/gates/coach/pages/InstructorDashboard";
import Dashboard from "@/features/gates/admin/pages/Dashboard";
import Certificates from "@/features/certificates/pages/Certificates";
import TestDashboard from "@/features/testing/pages/TestDashboard";
import ApiPlayground from "@/features/testing/pages/ApiPlayground";

// Lessons
import StudentLessonsPage from "@/features/lessons/pages/StudentLessonsPage";
import LessonDetailPage from "@/features/lessons/pages/LessonDetailPage";
import LessonQuizPage from "@/features/lessons/pages/LessonQuizPage";
import AdminLessonQuizPage from "@/features/lessons/admin/pages/AdminLessonQuizPage";
//Modules
import CreateModulePage from "@/features/modules/pages/CreateModulePage";
// Exams
import StudentExamListPage from "@/features/testing/pages/StudentExamListPage";
import ExamInterfacePage from "@/features/testing/pages/ExamInterfacePage";
import MyExamResultsPage from "@/features/testing/pages/MyExamResultsPage";
import AdminExamListPage from "@/features/testing/pages/AdminExamListPage";
import AdminExamEditPage from "@/features/testing/pages/AdminExamEditPage";

// Coach dashboard
import CoachDashboard from "@/features/gates/coach/components/CoachDashboard";
import MyProfilePage from "@/features/players/pages/MyProfilePage";
import path from "path";
import AdminAttendancePage from "@/features/attendance/pages/AdminAttendancePage";

export const appRoutes = [
  { path: "/", element: <Index /> },

  // Public
  { path: "/rankings", element: <Rankings /> },
  { path: "/programs", element: <Programs /> },
  { path: "/coaches", element: <Coaches /> },
  { path: "/library", element: <Library /> },
  { path: "/library/article/:id", element: <ArticlePage /> },
  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/silat-history", element: <SilatHistory /> },
  { path: "/events", element: <Events /> },
  { path: "/test-api", element: <TestDashboard /> },
  { path: "/api-playground", element: <ApiPlayground /> },

  // Player
  { path: "/player/:id", element: <PlayerProfile /> },
  { path: "/player/:id/certificate", element: <Certificates /> },
  {
    path: "/me/profile",
    element: (
      <ProtectedRoute>
        <MyProfilePage />
      </ProtectedRoute>
    ),
  },
  //Certificates
  { path: "/certificate/:id", element: <Certificates /> },

  //Test Module Pages
  { path: "/create-module", element: <CreateModulePage /> },

  // Lessons (Student)
  { path: "/student/lessons", element: <StudentLessonsPage /> },
  { path: "/student/lessons/:lessonId", element: <LessonDetailPage /> },
  { path: "/student/lessons/:lessonId/quiz", element: <LessonQuizPage /> },

  // Exams (Student)
  {
    path: "/student/exams",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentExamListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/exams/:examId",
    element: (
      <ProtectedRoute requiredRole="student">
        <ExamInterfacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/exams/results",
    element: (
      <ProtectedRoute requiredRole="student">
        <MyExamResultsPage />
      </ProtectedRoute>
    ),
  },

  // Student dashboard
  {
    path: "/student/attendance",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student-dashboard",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },

  // Exam shared
  {
    path: "/exam/:examId",
    element: (
      <ProtectedRoute>
        <ExamInterface />
      </ProtectedRoute>
    ),
  },

  // Admin
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/lessons/:lessonId/quiz",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLessonQuizPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/exams",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminExamListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/exams/:examId",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminExamEditPage />
      </ProtectedRoute>
    ),
  },

  // Instructor
  {
    path: "/instructor-dashboard",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <InstructorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <CoachDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "/attendance",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminAttendancePage />
      </ProtectedRoute>
    ),
  },

  // 404
  { path: "*", element: <NotFound /> },
];
