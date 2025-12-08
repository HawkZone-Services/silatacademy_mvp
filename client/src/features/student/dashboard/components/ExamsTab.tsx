// src/features/student/dashboard/components/ExamsTab.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AlertCircle, ClipboardList } from "lucide-react";

import { AttemptItem, ExamItem } from "../types";
import { startExamAttempt } from "../api/api";
import { TabsContent } from "@/components/ui/tabs";

interface Props {
  exams: ExamItem[];
  attempts: AttemptItem[];
}

export default function ExamsTab({ exams, attempts }: Props) {
  const navigate = useNavigate();
  const [selectedExamTab, setSelectedExamTab] = useState<
    "available" | "history"
  >("available");

  const canAccessExam = (exam: ExamItem) => {
    if (exam.locked || exam.isEligible === false) return false;
    return true;
  };

  const handleStartExam = async (exam: ExamItem) => {
    if (!canAccessExam(exam)) return;

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
              Exams you can register for or start, based on your attendance and
              lesson completion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exams.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No available exams at the moment.
              </p>
            )}

            {exams.map((exam) => {
              const locked = exam.locked || exam.isEligible === false;
              const reason = exam.reasonIfNotEligible || exam.lockedReason;
              const progressText =
                typeof exam.lessonsRequired === "number"
                  ? `${exam.lessonsCompleted || 0}/${
                      exam.lessonsRequired
                    } lessons completed`
                  : null;

              return (
                <div
                  key={exam._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-accent/10"
                >
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {exam.title}
                      <Badge variant="outline" className="capitalize text-xs">
                        {exam.beltLevel || "belt"}
                      </Badge>
                      {locked && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <AlertCircle className="h-3 w-3" /> Locked
                        </Badge>
                      )}
                    </h3>
                    {progressText && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {progressText}
                      </p>
                    )}
                    {reason && (
                      <p className="text-xs text-red-600 mt-1">{reason}</p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    disabled={locked}
                    onClick={() => handleStartExam(exam)}
                  >
                    {locked ? "Locked" : "Start Exam"}
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
            <CardTitle>My Attempts & Results</CardTitle>
            <CardDescription>
              Track your theory scores, practical evaluation, and final results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attempts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t taken any exams yet.
              </p>
            )}

            {attempts.map((att) => {
              const exam = att.exam || ({} as ExamItem);
              const statusLabel = att.finalPassed
                ? "Passed"
                : att.finalPassed === false
                ? "Failed"
                : att.submittedAt
                ? "Waiting for practical"
                : "In progress";

              return (
                <div
                  key={att._id}
                  className="p-3 rounded-lg border border-border/50 bg-accent/10 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {exam.title}
                      <Badge variant="outline" className="capitalize text-xs">
                        {exam.beltLevel || "belt"}
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Theory: {att.theoryScore ?? 0} /{" "}
                      {exam.maxTheoryScore ?? "?"} • Final:{" "}
                      {att.finalTotalScore ?? "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status: {statusLabel}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/student/exams/${exam._id}?attempt=${att._id}`)
                    }
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}
