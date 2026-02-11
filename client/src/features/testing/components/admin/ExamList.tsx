import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import examService from "@/features/testing/api/examService";

interface ExamListProps {
  exams: any[];
  onRefresh: () => void;
}

export function ExamList({ exams = [], onRefresh }: ExamListProps) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const publishExam = async (examId: string) => {
    if (!token) return;

    await examService.publishExam(examId);

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
