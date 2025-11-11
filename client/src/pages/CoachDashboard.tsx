import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, GraduationCap, FileCheck, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateExamDialog } from "@/components/CoachExamGate/CreateExamDialog";
import { GradingInterface } from "@/components/CoachExamGate/GradingInterface";
import { ExamsList } from "@/components/CoachExamGate/ExamList";

export default function CoachDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExams: 0,
    pendingGrading: 0,
    activeStudents: 0,
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: examsCount } = await supabase
      .from("exams")
      .select("*", { count: "exact", head: true });

    const { count: pendingCount } = await supabase
      .from("exam_results")
      .select("*", { count: "exact", head: true })
      .is("admin_approved", false);

    const { count: studentsCount } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    setStats({
      totalExams: examsCount || 0,
      pendingGrading: pendingCount || 0,
      activeStudents: studentsCount || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            {t("dashboard")} - {t("coach")}
          </h1>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            {t("createNewExam")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border shadow-[var(--shadow-elevated)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("exams")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExams}</div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-[var(--shadow-elevated)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("gradeExams")}
              </CardTitle>
              <FileCheck className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingGrading}</div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-[var(--shadow-elevated)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("students")}
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="exams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="exams">{t("manageExams")}</TabsTrigger>
            <TabsTrigger value="grading">{t("gradeExams")}</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4">
            <ExamsList onRefresh={fetchStats} />
          </TabsContent>

          <TabsContent value="grading" className="space-y-4">
            <GradingInterface onGraded={fetchStats} />
          </TabsContent>
        </Tabs>

        <CreateExamDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={fetchStats}
        />
      </div>
    </div>
  );
}
