import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { Timer } from "lucide-react";

import { getExamById } from "@/features/testing/api/getExamById";
import { getMyAttempts } from "@/features/testing/api/getMyAttempts";
import { submitAttempt as submitAttemptApi } from "@/features/testing/api/submitAttempt";

export default function ExamInterface() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { examId } = useParams();
  const [params] = useSearchParams();
  const attemptId = params.get("attempt");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [answers, setAnswers] = useState<any>({});
  const [focusLosses, setFocusLosses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [forcedSubmit, setForcedSubmit] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qc = useQueryClient();

  /* =========================
     BASIC ACCESS GUARD
  ========================= */
  useEffect(() => {
    if (!attemptId || !examId) {
      toast({
        variant: "destructive",
        title: "Invalid attempt",
        description: "You cannot access this exam.",
      });
      navigate("/student-dashboard");
    }
  }, [attemptId, examId, navigate, toast]);

  /* =========================
     FETCH EXAM
  ========================= */
  const examQuery = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamById(examId as string),
    enabled: !!examId && !!token,
  });

  /* =========================
     FETCH MY ATTEMPTS
  ========================= */
  const attemptsQuery = useQuery({
    queryKey: ["my-attempts"],
    queryFn: getMyAttempts,
    enabled: !!attemptId && !!token,
  });

  const exam = examQuery.data?.data?.exam ?? examQuery.data?.data ?? null;

  const attempts =
    attemptsQuery.data?.data?.attempts ?? attemptsQuery.data?.data ?? [];

  const attempt = attempts.find((a: any) => a?._id === attemptId);

  const readOnly = Boolean(attempt?.submittedAt);

  /* =========================
     VALIDATE ATTEMPT
  ========================= */
  useEffect(() => {
    if (!attempt && attemptsQuery.isSuccess) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "No active attempt found.",
      });
      navigate("/student-dashboard");
    }
  }, [attempt, attemptsQuery.isSuccess, navigate, toast]);

  /* =========================
     INIT TIMER
  ========================= */
  useEffect(() => {
    if (exam?.timeLimit) {
      setTimeLeft(exam.timeLimit * 60);
    }
  }, [exam?.timeLimit]);

  useEffect(() => {
    const onBlur = () => setFocusLosses((x) => x + 1);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  useEffect(() => {
    if (!exam?.timeLimit || forcedSubmit || readOnly) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam?.timeLimit, forcedSubmit, readOnly]);

  /* =========================
     SUBMIT MUTATION
  ========================= */
  const submitMutation = useMutation({
    mutationFn: submitAttemptApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-attempts"] });

      localStorage.setItem("refreshResults", "1");

      toast({
        title: "Exam submitted",
        description: forcedSubmit
          ? "Time expired. Your answers were submitted automatically."
          : "Your theory exam has been submitted successfully.",
      });

      navigate("/student-dashboard");
    },
    onError: (err: any) => {
      console.error("Submit error:", err);
      toast({
        variant: "destructive",
        title: "Submit failed",
        description: err?.message || "An error occurred.",
      });
    },
  });

  /* =========================
     ANSWERS HANDLERS
  ========================= */
  const handleMCQ = (qId: string, index: number) => {
    if (readOnly) return;
    setAnswers((prev: any) => ({
      ...prev,
      [qId]: { selectedIndex: index },
    }));
  };

  const handleTrueFalse = (qId: string, value: boolean) => {
    if (readOnly) return;
    setAnswers((prev: any) => ({
      ...prev,
      [qId]: { booleanAnswer: value },
    }));
  };

  const handleEssay = (qId: string, text: string) => {
    if (readOnly) return;
    setAnswers((prev: any) => ({
      ...prev,
      [qId]: { essayText: text },
    }));
  };

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleSubmit = useCallback(
    (autoForced = false) => {
      if (!exam || submitMutation.isPending || readOnly) return;

      const formattedAnswers = exam.questions.map((q: any) => ({
        questionId: q._id,
        selectedIndex:
          answers[q._id]?.selectedIndex !== undefined
            ? answers[q._id].selectedIndex
            : null,
        booleanAnswer:
          answers[q._id]?.booleanAnswer !== undefined
            ? answers[q._id].booleanAnswer
            : null,
        essayText: answers[q._id]?.essayText || "",
      }));

      setForcedSubmit(autoForced);

      submitMutation.mutate({
        attemptId: attemptId as string,
        answers: formattedAnswers,
        focusLosses,
        forcedSubmitReason: autoForced ? "TIME_EXPIRED" : null,
      });
    },
    [answers, attemptId, exam, focusLosses, submitMutation, readOnly]
  );

  const formatTime = (seconds: number) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (examQuery.isLoading || attemptsQuery.isLoading || !exam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading exam...</span>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen p-6">
      <Card className="mx-auto max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{exam.title}</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{exam.questions.length} Questions</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeLeft)}
              </Badge>
            </span>
          </CardTitle>

          {readOnly && (
            <Badge variant="secondary" className="mx-auto mt-2 block w-fit">
              Exam already submitted (read-only)
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {exam.questions.map((q: any, index: number) => (
            <div key={q._id} className="p-4 rounded-lg border bg-card/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  Q{index + 1}. {q.text || q.question}
                </h3>
                <Badge variant="outline" className="capitalize">
                  {q.type}
                </Badge>
              </div>

              {q.type === "mcq" && (
                <RadioGroup
                  value={
                    answers[q._id]?.selectedIndex !== undefined
                      ? String(answers[q._id].selectedIndex)
                      : undefined
                  }
                  onValueChange={(v) => handleMCQ(q._id, Number(v))}
                >
                  {q.choices.map((choice: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={String(i)}
                        id={`${q._id}-${i}`}
                        disabled={readOnly}
                      />
                      <label htmlFor={`${q._id}-${i}`}>{choice}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.type === "truefalse" && (
                <div className="space-x-4">
                  <Button
                    variant={
                      answers[q._id]?.booleanAnswer === true
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleTrueFalse(q._id, true)}
                    disabled={readOnly}
                  >
                    True
                  </Button>

                  <Button
                    variant={
                      answers[q._id]?.booleanAnswer === false
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleTrueFalse(q._id, false)}
                    disabled={readOnly}
                  >
                    False
                  </Button>
                </div>
              )}

              {q.type === "essay" && (
                <Textarea
                  placeholder="Write your answer..."
                  value={answers[q._id]?.essayText || ""}
                  onChange={(e) => handleEssay(q._id, e.target.value)}
                  disabled={readOnly}
                />
              )}
            </div>
          ))}

          <Button
            className="w-full py-6 text-lg"
            onClick={() => handleSubmit(false)}
            disabled={submitMutation.isPending || readOnly}
          >
            {readOnly ? "Exam Submitted" : "Submit Exam"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
