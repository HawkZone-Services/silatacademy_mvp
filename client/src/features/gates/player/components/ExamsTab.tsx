import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import { AlertCircle, ClipboardList } from "lucide-react";

import { AttemptItem, ExamItem } from "../types";
import { TabsContent } from "@/shared/ui/tabs";
import { startExamAttempt } from "../api/api";
import { registerForExam } from "../api/registerForExam";

interface Props {
  exams: ExamItem[];
  attempts: AttemptItem[];
  onRefreshExams: () => Promise<void>;
}

export default function ExamsTab({ exams, attempts, onRefreshExams }: Props) {
  const navigate = useNavigate();
  const [selectedExamTab, setSelectedExamTab] = useState<
    "available" | "history"
  >("available");

  const handleStartExam = async (exam: ExamItem) => {
    const attemptId = await startExamAttempt(exam._id);
    if (!attemptId) return;
    navigate(`/student/exams/${exam._id}?attempt=${attemptId}`);
  };

  return (
    <TabsContent value="exams" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Exams & Results
        </h2>

        <div className="flex gap-2 text-sm">
          <Button
            variant={selectedExamTab === "available" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedExamTab("available")}
          >
            Available Exams
          </Button>
          <Button
            variant={selectedExamTab === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedExamTab("history")}
          >
            My Attempts
          </Button>
        </div>
      </div>

      {selectedExamTab === "available" && (
        <Card>
          <CardHeader>
            <CardTitle>Available Exams</CardTitle>
            <CardDescription>
              Based on attendance and lesson completion.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {exams.map((exam: any) => {
              let actionLabel = "Locked";
              let actionHandler: (() => void) | undefined;

              if (!exam.locked) {
                if (!exam.registrationStatus) {
                  actionLabel = "Register";
                  actionHandler = async () => {
                    await registerForExam(exam._id);
                    await onRefreshExams();
                  };
                } else if (exam.registrationStatus === "pending") {
                  actionLabel = "Pending Approval";
                } else if (exam.registrationStatus === "approved") {
                  // ✅ لو النظري اتسلم بالفعل
                  if (exam.theorySubmitted && !exam.finalized) {
                    actionLabel = "Theory Submitted";
                  } else if (exam.finalized) {
                    actionLabel = "View Result";
                    actionHandler = () =>
                      navigate(
                        `/student/exams/results?attempt=${exam.attemptId}`
                      );
                  } else {
                    actionLabel = "Start Exam";
                    actionHandler = () => handleStartExam(exam);
                  }
                } else if (exam.registrationStatus === "rejected") {
                  actionLabel = "Rejected";
                }
              }

              return (
                <div
                  key={exam._id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {exam.title}
                      <Badge variant="outline" className="capitalize text-xs">
                        {exam.beltLevel}
                      </Badge>
                      {exam.locked && (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3" /> Locked
                        </Badge>
                      )}
                    </h3>

                    {exam.lockedReason && (
                      <p className="text-xs text-red-600 mt-1">
                        {exam.lockedReason}
                      </p>
                    )}

                    {exam.theorySubmitted &&
                      typeof exam.theoryPassed === "boolean" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Theory: {exam.theoryPassed ? "Passed" : "Failed"} —
                          Score: {exam.theoryScore ?? "-"}
                        </p>
                      )}
                  </div>

                  <Button
                    size="sm"
                    disabled={!actionHandler}
                    onClick={actionHandler}
                  >
                    {actionLabel}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {selectedExamTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>My Attempts</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {attempts.map((att: any) => (
              <div
                key={att._id}
                className="p-3 rounded-lg border flex justify-between"
              >
                <div>
                  <p className="font-semibold">{att.exam?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Theory:{" "}
                    {typeof att.theoryPassed === "boolean"
                      ? att.theoryPassed
                        ? "Passed"
                        : "Failed"
                      : "-"}{" "}
                    — Score: {att.theoryScore ?? "-"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(`/student/exams/results?attempt=${att._id}`)
                  }
                >
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}
