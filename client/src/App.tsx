import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
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
import SilatHistory from "./pages/SilatHistory";
import Events from "./pages/Events";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import Dashboard from "./pages/Dashboard";
import Certificates from "./pages/Certificates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/player/:id" element={<PlayerProfile />} />
              <Route
                path="/player/:id/certificate"
                element={<Certificates />}
              />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/coaches" element={<Coaches />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/article/:id" element={<ArticlePage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/silat-history" element={<SilatHistory />} />
              <Route path="/events" element={<Events />} />

              {/* Protected Routes */}

              <Route
                path="/exam/:examId"
                element={
                  <ProtectedRoute>
                    <ExamInterface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor-dashboard"
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
