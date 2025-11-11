import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CheckCircle, Clock } from "lucide-react";

interface Submission {
  id: string;
  student_name: string;
  exam_title: string;
  submitted_at: string;
  theoretical_score: number;
  graded: boolean;
}

interface GradingInterfaceProps {
  onGraded: () => void;
}

export function GradingInterface({ onGraded }: GradingInterfaceProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exam_results")
      .select(
        `
        id,
        theoretical_score,
        created_at,
        graded_at,
        instructor_comments,
        student:profiles!exam_results_student_id_fkey(full_name),
        exam:exams!exam_results_exam_id_fkey(title)
      `
      )
      .is("admin_approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      const formatted =
        data?.map((item) => ({
          id: item.id,
          student_name: (item.student as any)?.full_name || "Unknown",
          exam_title: (item.exam as any)?.title || "Unknown",
          submitted_at: item.created_at,
          theoretical_score: item.theoretical_score,
          graded: !!item.graded_at,
        })) || [];
      setSubmissions(formatted);
    }
    setLoading(false);
  };

  const handleSubmitGrade = async (submissionId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("exam_results")
      .update({
        instructor_comments: comments,
        graded_by: user.id,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("success"));
      setComments("");
      setSelectedSubmission(null);
      fetchSubmissions();
      onGraded();
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  return (
    <div className="grid gap-4">
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No submissions pending grading
          </CardContent>
        </Card>
      ) : (
        submissions.map((submission) => (
          <Card
            key={submission.id}
            className="border-border shadow-[var(--shadow-elevated)]"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {submission.student_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {submission.exam_title}
                  </p>
                </div>
                <Badge variant={submission.graded ? "default" : "secondary"}>
                  {submission.graded ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Graded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  Score: <strong>{submission.theoretical_score}%</strong>
                </span>
                <span className="text-muted-foreground">
                  Submitted:{" "}
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </span>
              </div>

              {selectedSubmission === submission.id ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add your comments and feedback..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSubmitGrade(submission.id)}
                      disabled={!comments.trim()}
                    >
                      {t("submit")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedSubmission(null);
                        setComments("");
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(submission.id)}
                  disabled={submission.graded}
                >
                  {submission.graded ? "Already Graded" : "Grade & Comment"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
