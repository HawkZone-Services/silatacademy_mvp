import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function ExamInterface() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { examId } = useParams();

  const [params] = useSearchParams();
  const attemptId = params.get("attempt");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [exam, setExam] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [focusLosses, setFocusLosses] = useState(0);

  /* ---------------------------------------------
     Prevent entering without attempt ID
  --------------------------------------------- */
  useEffect(() => {
    if (!attemptId || !examId) {
      toast({
        variant: "destructive",
        title: "Invalid attempt",
        description: "You cannot access this exam.",
      });
      navigate("/dashboard");
    }
  }, [attemptId, examId]);

  /* ---------------------------------------------
     Fetch Exam Data
  --------------------------------------------- */
  const fetchExam = async () => {
    try {
      const res = await fetch(`${API}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExam(data.exam);
    } catch (err) {
      console.error("Exam fetch error:", err);
    }
  };

  /* ---------------------------------------------
     Fetch Attempt (Ensure it's valid)
  --------------------------------------------- */
  const fetchAttempt = async () => {
    try {
      const res = await fetch(`${API}/exams/my-attempts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const found = data.attempts.find((a: any) => a._id === attemptId);

      if (!found) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You have no active attempt for this exam.",
        });
        navigate("/dashboard");
        return;
      }

      // Prevent re-access after submission
      if (found.submittedAt) {
        toast({
          variant: "destructive",
          title: "Exam already submitted",
        });
        navigate("/dashboard");
      }

      setAttempt(found);
    } catch (err) {
      console.error("Attempt fetch error:", err);
    }
  };

  /* ---------------------------------------------
     Focus Loss Detection
  --------------------------------------------- */
  useEffect(() => {
    const onBlur = () => setFocusLosses((x) => x + 1);
    window.addEventListener("blur", onBlur);

    return () => window.removeEventListener("blur", onBlur);
  }, []);

  /* ---------------------------------------------
     Load Exam + Attempt
  --------------------------------------------- */
  useEffect(() => {
    if (!token) return;
    Promise.all([fetchExam(), fetchAttempt()]).finally(() => setLoading(false));
  }, [token]);

  /* ---------------------------------------------
     Handle Answer Changes
  --------------------------------------------- */
  const handleMCQ = (qId: string, index: number) => {
    setAnswers({
      ...answers,
      [qId]: { selectedIndex: index },
    });
  };

  const handleTrueFalse = (qId: string, value: boolean) => {
    setAnswers({
      ...answers,
      [qId]: { booleanAnswer: value },
    });
  };

  const handleEssay = (qId: string, text: string) => {
    setAnswers({
      ...answers,
      [qId]: { essayText: text },
    });
  };

  /* ---------------------------------------------
     Submit Exam Attempt
  --------------------------------------------- */
  const handleSubmit = async () => {
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

    try {
      const res = await fetch(`${API}/exams/attempt/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          answers: formattedAnswers,
          focusLosses,
          forcedSubmitReason: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Submit failed",
          description: data.message || "An error occurred.",
        });
        return;
      }

      toast({
        title: "Exam submitted",
        description: "Your theory exam has been submitted successfully.",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  /* ---------------------------------------------
     Rendering
  --------------------------------------------- */
  if (loading || !exam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading exam...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Card className="mx-auto max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {exam.title}
          </CardTitle>
          <div className="text-center text-muted-foreground">
            {exam.questions.length} Questions • {exam.timeLimit} Minutes
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {exam.questions.map((q: any, index: number) => (
            <div key={q._id} className="p-4 rounded-lg border bg-card/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  Q{index + 1}. {q.question}
                </h3>
                <Badge variant="outline" className="capitalize">
                  {q.type}
                </Badge>
              </div>

              {/* MCQ */}
              {q.type === "mcq" && (
                <RadioGroup onValueChange={(v) => handleMCQ(q._id, Number(v))}>
                  {q.choices.map((choice: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(i)} id={`${q._id}-${i}`} />
                      <label htmlFor={`${q._id}-${i}`}>{choice}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* TRUE / FALSE */}
              {q.type === "truefalse" && (
                <div className="space-x-4">
                  <Button
                    variant={
                      answers[q._id]?.booleanAnswer === true
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleTrueFalse(q._id, true)}
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
                  >
                    False
                  </Button>
                </div>
              )}

              {/* ESSAY */}
              {q.type === "essay" && (
                <Textarea
                  placeholder="Write your answer here..."
                  onChange={(e) => handleEssay(q._id, e.target.value)}
                />
              )}
            </div>
          ))}

          <Button className="w-full py-6 text-lg" onClick={handleSubmit}>
            Submit Exam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
