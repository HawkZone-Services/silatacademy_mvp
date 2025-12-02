// src/routes/appRoutes.ts
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import PlayerProfile from "@/pages/PlayerProfile";
import Rankings from "@/pages/Rankings";
import Programs from "@/pages/Programs";
import Coaches from "@/pages/Coaches";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import Library from "@/pages/Library";
import ArticlePage from "@/pages/ArticlePage";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import ExamInterface from "@/pages/ExamInterface";
import SilatHistory from "@/pages/SilatHistory";
import Events from "@/pages/Events";
import StudentDashboard from "@/pages/StudentDashboard";
import InstructorDashboard from "@/pages/InstructorDashboard";
import Dashboard from "@/pages/Dashboard";
import Certificates from "@/pages/Certificates";
import TestDashboard from "@/pages/TestDashboard";
import ApiPlayground from "@/pages/ApiPlayground";

// Lessons
import StudentLessonsPage from "@/features/lessons/pages/StudentLessonsPage";
import LessonDetailPage from "@/features/lessons/pages/LessonDetailPage";
import LessonQuizPage from "@/features/lessons/pages/LessonQuizPage";

// Exams
import StudentExamListPage from "@/features/exams/pages/StudentExamListPage";
import ExamInterfacePage from "@/features/exams/pages/ExamInterfacePage";
import MyExamResultsPage from "@/features/exams/pages/MyExamResultsPage";
import AdminExamListPage from "@/features/exams/pages/AdminExamListPage";
import AdminExamEditPage from "@/features/exams/pages/AdminExamEditPage";

// Coach dashboard
import CoachDashboard from "@/components/coach/CoachDashboard";

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

  // 404
  { path: "*", element: <NotFound /> },
];
