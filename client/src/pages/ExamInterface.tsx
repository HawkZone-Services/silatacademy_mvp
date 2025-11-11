import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
  points: number;
  order_index: number;
}

interface Exam {
  id: string;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
}

export default function ExamInterface() {
  const { t } = useTranslation();
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [windowSwitches, setWindowSwitches] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);

  useEffect(() => {
    initializeExam();
  }, [examId, user]);

  // Anti-cheat monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !cheatingDetected && attemptId) {
        setWindowSwitches((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setCheatingDetected(true);
            toast.error(t("examClosedCheating"));
            handleSubmit(true);
          } else {
            toast.warning(`${t("windowSwitchWarning")} (${newCount}/3)`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [cheatingDetected, attemptId, t]);

  useEffect(() => {
    if (timeRemaining <= 0 && attemptId) {
      toast.warning(t("timeUp"));
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attemptId]);

  const initializeExam = async () => {
    try {
      const [examResponse, questionsResponse] = await Promise.all([
        supabase.from("exams").select("*").eq("id", examId).single(),
        supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("order_index"),
      ]);

      if (examResponse.error) throw examResponse.error;
      if (questionsResponse.error) throw questionsResponse.error;

      setExam(examResponse.data);
      setQuestions(questionsResponse.data);
      setTimeRemaining(examResponse.data.time_limit_minutes * 60);

      const { data: attemptData, error: attemptError } = await supabase
        .from("exam_attempts")
        .insert({
          exam_id: examId,
          student_id: user?.id,
          time_remaining_seconds: examResponse.data.time_limit_minutes * 60,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttemptId(attemptData.id);
    } catch (error: any) {
      toast.error("Failed to load exam");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async (isCheating = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let totalScore = 0;
      let totalPoints = 0;

      for (const question of questions) {
        totalPoints += question.points;
        const answer = answers[question.id] || "";
        const isCorrect =
          question.question_type === "multiple_choice"
            ? answer === question.correct_answer
            : false;
        const pointsEarned = isCorrect ? question.points : 0;
        totalScore += pointsEarned;

        await supabase.from("exam_answers").insert({
          attempt_id: attemptId,
          question_id: question.id,
          answer_text: answer,
          is_correct:
            question.question_type === "multiple_choice" ? isCorrect : null,
          points_earned: pointsEarned,
        });
      }

      const finalScore = Math.round((totalScore / totalPoints) * 100);
      const passed = finalScore >= (exam?.passing_score || 70);

      await supabase
        .from("exam_attempts")
        .update({
          submitted_at: new Date().toISOString(),
          status: "submitted",
          window_switches: windowSwitches,
          cheating_detected: isCheating,
        })
        .eq("id", attemptId);

      await supabase.from("exam_results").insert({
        attempt_id: attemptId,
        student_id: user?.id,
        exam_id: examId,
        theoretical_score: finalScore,
        total_score: finalScore,
        passed,
      });

      toast.success(
        isCheating ? t("examSubmittedCheating") : t("examSubmitted")
      );
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />

      {windowSwitches > 0 && !cheatingDetected && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-2">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-yellow-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("windowSwitchWarning")} ({windowSwitches}/3)
            </span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">
              {t("question")} {currentQuestionIndex + 1} {t("of")}{" "}
              {questions.length}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300
                ? "bg-destructive/20 text-destructive"
                : "bg-muted"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-lg font-mono font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card className="border-border shadow-[var(--shadow-elevated)]">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.question_text}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentQuestion.points} {t("points")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.question_type === "multiple_choice" ? (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  handleAnswer(currentQuestion.id, value)
                }
              >
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswer(currentQuestion.id, e.target.value)
                }
                placeholder={t("typeAnswer")}
                rows={6}
              />
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                {t("previous")}
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  {t("submit")}
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                >
                  {t("next")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("examSubmitConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? t("loading") : t("submit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
