import { useEffect, useState } from "react";
import examService from "@/features/testing/api/examService";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Lock, PlayCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentExamList() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await examService.getAvailableExams();
      const list = Array.isArray(res?.exams)
        ? res.exams
        : Array.isArray(res?.data?.exams)
        ? res.data.exams
        : [];
      setExams(list);
    } catch (err) {
      console.error("Exam fetch error:", err);
      setExams([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const registerExam = async (examId) => {
    const res = await examService.registerForExam({ examId });
    if (res?.success || res?.ok) loadExams();
  };

  const startExam = async (examId) => {
    const res = await examService.startAttempt(examId);
    const attemptId = res?.attemptId || res?.data?.attemptId;
    if (res?.success !== false && attemptId) {
      navigate(`/student/exams/${examId}?attempt=${attemptId}`);
    }
  };

  if (loading) return <p>Loading exams...</p>;

  return (
    <div className="space-y-6">
      {exams.length === 0 && (
        <p className="text-muted-foreground">No exams available.</p>
      )}

      {exams.map((exam) => (
        <Card key={exam._id} className="border border-border/40">
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="capitalize">{exam.beltLevel}</Badge>

              {exam.locked ? (
                <Badge variant="destructive">Locked</Badge>
              ) : (
                <Badge variant="secondary">Open</Badge>
              )}
            </div>

            {/* Lessons Progress */}
            {exam.locked && (
              <p className="text-sm text-muted-foreground">
                Lessons required: {exam.lessonsCompleted}/{exam.lessonsRequired}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              {exam.finalPassed ? (
                <Button disabled variant="outline">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Button>
              ) : exam.locked ? (
                <Button disabled variant="destructive">
                  <Lock className="h-4 w-4 mr-1" />
                  Locked
                </Button>
              ) : exam.status === "registered" ? (
                <Button onClick={() => startExam(exam._id)}>
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Start Exam
                </Button>
              ) : (
                <Button onClick={() => registerExam(exam._id)}>Register</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
