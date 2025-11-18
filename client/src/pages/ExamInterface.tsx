// ===============================
// IMPORTS
// ===============================
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// -------------------------------
// API BASE URL
// -------------------------------
const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function ExamInterface() {
  // ===============================
  // ROUTER PARAMS
  // ===============================
  const { examId } = useParams(); // examId from URL: /exam/:examId
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const attemptFromQuery = searchParams.get("attempt"); // allow continuing existing attempt

  // ===============================
  // AUTH
  // ===============================
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null");

  // ===============================
  // STATE
  // ===============================
  const [exam, setExam] = useState<any>(null); // exam details from API
  const [questions, setQuestions] = useState<any[]>([]); // exam.questions
  const [attemptId, setAttemptId] = useState<string | null>(attemptFromQuery); // active attemptId

  const [answers, setAnswers] = useState<any>({}); // student answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // navigation slider

  const [timeRemaining, setTimeRemaining] = useState(0); // countdown timer
  const [loading, setLoading] = useState(true);

  // Anti-cheat
  const [focusLosses, setFocusLosses] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===============================
  // 1) Load exam by ID
  // ===============================
  const loadExam = async () => {
    try {
      const res = await fetch(`${API}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setExam(data.exam);
      setQuestions(data.exam.questions);

      // FIXED TIMER → 20 minutes
      setTimeRemaining((data.exam.timeLimit || 20) * 60);
      console.log(data.exam.timeLimit);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load exam",
      });
    }
  };
  // ===============================
  // 2) Start new attempt if none exists
  // ===============================
  const startAttempt = async () => {
    if (attemptId) return;

    try {
      const res = await fetch(`${API}/exams/attempt/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId, studentId: user._id }),
      });

      const data = await res.json();
      setAttemptId(data.attemptId);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not start exam",
      });
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    loadExam()
      .then(startAttempt)
      .finally(() => setLoading(false));
  }, []);

  // ===============================
  // TIMER
  // ===============================
  // Timer Run Once – Only When Attempt Exists & Time Is Set
  // TIMER — runs once when attemptId is ready
  useEffect(() => {
    if (!attemptId) return;
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          toast({
            title: "Time up",
            description: "Submitting your exam automatically.",
          });

          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId]); // NOT timeRemaining

  // ===============================
  // ANTI-CHEAT: Detect switching tabs
  // ===============================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && attemptId) {
        setFocusLosses((prev) => {
          const updated = prev + 1;

          toast({
            variant: updated >= 3 ? "destructive" : "warning",
            title:
              updated >= 3
                ? "Cheating detected! Exam will be submitted."
                : `Warning: Window switched (${updated}/3)`,
          });

          // Auto-submit if max warnings reached
          if (updated >= 3) {
            setCheatingDetected(true);
            handleSubmit(true);
          }

          return updated;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [attemptId]);

  // ===============================
  // UPDATE ANSWER
  // ===============================
  const handleAnswer = (qid: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [qid]: value }));
  };

  // ===============================
  // SUBMIT EXAM
  // ===============================
  const handleSubmit = async (forced = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Format answers for backend API
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id.toString(),
        selectedIndex:
          q.type === "mcq" ? q.choices.indexOf(answers[q._id] || "") : null,
        booleanAnswer:
          q.type === "truefalse" ? answers[q._id] === "true" : null,
        essayText: q.type === "essay" ? answers[q._id] || "" : "",
      }));

      const res = await fetch(`${API}/exams/attempt/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attemptId,
          answers: formattedAnswers,
          focusLosses,
          forcedSubmitReason: forced ? "CHEATING" : null,
        }),
      });

      const data = await res.json();
      console.log(JSON.stringify(formattedAnswers, null, 2));

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: data.message || "Submission failed",
        });
        return;
      }

      // Success feedback
      toast({
        title: "Exam submitted",
        description: data.pass
          ? "Congratulations! You passed."
          : "You did not pass this attempt.",
      });

      // Redirect to student dashboard
      navigate("/student-dashboard");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error submitting exam",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // RENDER LOADING
  // ===============================
  if (loading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading exam…</p>
      </div>
    );
  }

  // ===============================
  // CURRENT QUESTION
  // ===============================
  const q = questions[currentQuestionIndex];

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ===============================
  // UI RENDERING
  // ===============================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Exam Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>

          {/* TIMER */}
          <div
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              timeRemaining < 300
                ? "bg-red-500/20 text-red-500"
                : "bg-muted text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full mb-6">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* QUESTION CARD */}
        <Card>
          <CardHeader>
            <CardTitle>{q.text}</CardTitle>
            <p className="text-sm text-muted-foreground">{q.maxScore} points</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* MULTIPLE CHOICE */}
            {q.type === "mcq" ? (
              <RadioGroup
                value={answers[q._id] || ""}
                onValueChange={(v) => handleAnswer(q._id, v)}
              >
                {q.choices.map((c: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                  >
                    <RadioGroupItem value={c} id={`c-${idx}`} />
                    <Label htmlFor={`c-${idx}`}>{c}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              // ESSAY
              <Textarea
                rows={5}
                value={answers[q._id] || ""}
                onChange={(e) => handleAnswer(q._id, e.target.value)}
                placeholder="Type your answer…"
              />
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() =>
                  setCurrentQuestionIndex((i) => Math.max(0, i - 1))
                }
              >
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  variant="default"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((i) =>
                      Math.min(questions.length - 1, i + 1)
                    )
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SUBMIT CONFIRMATION */}
        {showSubmitDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <Card className="p-6 max-w-sm space-y-4">
              <h2 className="text-xl font-bold">Submit Exam?</h2>
              <p className="text-muted-foreground">
                You cannot change your answers after submission.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
