import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, PenTool } from "lucide-react";
import { StudentExam } from "../types/exam.types";
import { useNavigate } from "react-router-dom";

export function ExamCard({ exam }: { exam: StudentExam }) {
  const navigate = useNavigate();

  const locked = !exam.unlocked;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-lg">{exam.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {locked && exam.reasons?.length > 0 && (
          <p className="text-sm text-red-600">
            <Lock className="w-4 h-4 inline mr-1" />
            {exam.reasons[0]}
          </p>
        )}

        {!locked && (
          <Button
            onClick={() => navigate(`/student/exams/${exam._id}`)}
            className="flex items-center gap-2"
          >
            <PenTool size={16} />
            Start Exam
          </Button>
        )}

        {exam.status === "completed" && (
          <p className="text-green-600 flex items-center gap-1">
            <CheckCircle size={14} /> Score: {exam.score}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
