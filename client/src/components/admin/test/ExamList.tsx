import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EXAM_API = "https://api-f3rwhuz64a-uc.a.run.app/api/exams";

interface ExamListProps {
  exams: any[];
  onRefresh: () => void;
}

export function ExamList({ exams = [], onRefresh }: ExamListProps) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const publishExam = async (examId: string) => {
    if (!token) return;

    await fetch(`${EXAM_API}/admin/${examId}/publish`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    onRefresh?.();
  };

  if (!Array.isArray(exams) || exams.length === 0) {
    return <p className="text-muted-foreground">No exams created yet.</p>;
  }

  return (
    <div className="space-y-3">
      {exams.map((exam: any) => {
        const totalQuestions = exam.questions?.length || 0;
        const passMark = exam.passMark ?? 0;
        const maxTheoryScore = exam.maxTheoryScore ?? 40;
        const passPercent =
          maxTheoryScore > 0
            ? Math.round((passMark / maxTheoryScore) * 100)
            : passMark;

        return (
          <Card key={exam._id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">{exam.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Belt: {exam.beltLevel?.toUpperCase()} • Questions:{" "}
                  {totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pass mark: {passMark} / {maxTheoryScore} ({passPercent}%)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    exam.status === "published" ? "secondary" : "outline"
                  }
                  className="capitalize"
                >
                  {exam.status || "draft"}
                </Badge>

                {exam.status !== "published" && (
                  <Button size="sm" onClick={() => publishExam(exam._id)}>
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
