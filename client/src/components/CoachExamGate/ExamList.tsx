import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Eye, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Exam {
  id: string;
  title: string;
  description: string;
  belt_level: string;
  time_limit_minutes: number;
  status: string;
  passing_score: number;
}

interface ExamsListProps {
  onRefresh: () => void;
}

export function ExamsList({ onRefresh }: ExamsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", examToDelete);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("success"));
      fetchExams();
      onRefresh();
    }
    setDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  return (
    <>
      <div className="grid gap-4">
        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("noExamsAvailable")}
            </CardContent>
          </Card>
        ) : (
          exams.map((exam) => (
            <Card
              key={exam.id}
              className="border-border shadow-[var(--shadow-elevated)]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{exam.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {exam.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <span className="text-muted-foreground">
                      {t("timeLimit")}:{" "}
                      <strong>
                        {exam.time_limit_minutes} {t("minutes")}
                      </strong>
                    </span>
                    <span className="text-muted-foreground">
                      {t("passingScore")}:{" "}
                      <strong>{exam.passing_score}%</strong>
                    </span>
                    <Badge variant="outline">{exam.belt_level}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/coach/exam/${exam.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/coach/exam/${exam.id}/students`)
                      }
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExamToDelete(exam.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exam? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
