import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import lessonService from "@/features/lessons/api/lessonService";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

type QuizQuestion = {
  _id?: string;
  type: "mcq" | "truefalse";
  question: string;
  choices?: string[];
  correctIndex?: number; // مهم عشان computeQuizScore في الباك إند
};

export default function AdminLessonQuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  // ===========================
  // Load lesson (with quiz)
  // ===========================
  const loadLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const res: any = await lessonService.getLesson(lessonId);
      const lesson = res?.data?.lesson || res?.lesson || res?.data || res;

      setLessonTitle(lesson?.title || "Lesson");
      const existingQuiz = Array.isArray(lesson?.quiz) ? lesson.quiz : [];
      setQuiz(
        existingQuiz.map((q: any) => ({
          _id: q._id,
          type: q.type || "mcq",
          question: q.question || "",
          choices:
            q.type === "truefalse"
              ? ["True", "False"]
              : Array.isArray(q.choices)
              ? q.choices
              : ["", "", "", ""],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        }))
      );
    } catch (err) {
      console.error("Load lesson quiz error:", err);
      toast({
        title: "Error",
        description: "Failed to load lesson quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // ===========================
  // Handlers
  // ===========================
  const addQuestion = (type: "mcq" | "truefalse") => {
    if (type === "truefalse") {
      setQuiz((prev) => [
        ...prev,
        {
          type: "truefalse",
          question: "",
          choices: ["True", "False"],
          correctIndex: 0,
        },
      ]);
    } else {
      setQuiz((prev) => [
        ...prev,
        {
          type: "mcq",
          question: "",
          choices: ["", "", "", ""],
          correctIndex: 0,
        },
      ]);
    }
  };

  const updateQuestionField = (
    index: number,
    field: keyof QuizQuestion,
    value: any
  ) => {
    setQuiz((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateChoice = (qIndex: number, choiceIndex: number, value: string) => {
    setQuiz((prev) => {
      const copy = [...prev];
      const q = copy[qIndex];
      const choices = q.choices ? [...q.choices] : [];
      choices[choiceIndex] = value;
      copy[qIndex] = { ...q, choices };
      return copy;
    });
  };

  const removeQuestion = (index: number) => {
    setQuiz((prev) => prev.filter((_, i) => i !== index));
  };

  const setCorrectIndex = (qIndex: number, idx: number) => {
    setQuiz((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], correctIndex: idx };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!lessonId) return;

    // basic validation
    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (!q.question.trim()) {
        toast({
          title: "Validation error",
          description: `Question ${i + 1} text is required`,
          variant: "destructive",
        });
        return;
      }
      if (q.type === "mcq") {
        if (!q.choices || q.choices.length < 2) {
          toast({
            title: "Validation error",
            description: `Question ${i + 1}: at least 2 choices required`,
            variant: "destructive",
          });
          return;
        }
        if (
          typeof q.correctIndex !== "number" ||
          q.correctIndex < 0 ||
          q.correctIndex >= q.choices.length
        ) {
          toast({
            title: "Validation error",
            description: `Question ${i + 1}: please select correct answer`,
            variant: "destructive",
          });
          return;
        }
      } else if (q.type === "truefalse") {
        if (
          typeof q.correctIndex !== "number" ||
          ![0, 1].includes(q.correctIndex)
        ) {
          toast({
            title: "Validation error",
            description: `Question ${i + 1}: choose True or False as correct`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      // نرسل الكويز بالشكل اللي الباك إند متوقعه
      const payload = quiz.map((q) => ({
        type: q.type,
        question: q.question,
        choices: q.type === "truefalse" ? ["True", "False"] : q.choices,
        correctIndex: q.correctIndex ?? 0,
      }));

      const res: any = await lessonService.updateLessonQuiz(lessonId, payload);

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to save quiz");
      }

      toast({
        title: "Saved",
        description: "Lesson quiz updated successfully",
      });
    } catch (error: any) {
      console.error("Save quiz error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ===========================
  // Render
  // ===========================
  if (loading) {
    return (
      <div className="container py-10">
        <p>Loading lesson quiz...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            className="text-sm text-muted-foreground flex items-center gap-1 mb-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Quiz Builder
            <Badge variant="outline" className="text-xs">
              Lesson
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            Lesson: <strong>{lessonTitle}</strong>
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Quiz"}
        </Button>
      </div>

      <Card className="border-border/40">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">Questions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              type="button"
              onClick={() => addQuestion("mcq")}
            >
              <Plus className="h-4 w-4" />
              Add MCQ
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              type="button"
              onClick={() => addQuestion("truefalse")}
            >
              <Plus className="h-4 w-4" />
              Add True/False
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {quiz.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No questions yet. Use "Add MCQ" or "Add True/False" to start.
            </p>
          )}

          {quiz.map((q, index) => (
            <div
              key={index}
              className="border border-border/60 rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Q{index + 1}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {q.type === "mcq" ? "Multiple Choice" : "True / False"}
                  </Badge>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => removeQuestion(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Question text */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Question Text
                </label>
                <Textarea
                  value={q.question}
                  onChange={(e) =>
                    updateQuestionField(index, "question", e.target.value)
                  }
                  placeholder="Write the question here..."
                  rows={2}
                />
              </div>

              {/* Answers */}
              {q.type === "mcq" && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    Choices & correct answer
                  </p>
                  {(q.choices || []).map((choice, cIndex) => (
                    <div
                      key={cIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={q.correctIndex === cIndex}
                        onChange={() => setCorrectIndex(index, cIndex)}
                      />
                      <Input
                        value={choice}
                        onChange={(e) =>
                          updateChoice(index, cIndex, e.target.value)
                        }
                        placeholder={`Choice ${cIndex + 1}`}
                      />
                    </div>
                  ))}

                  {/* Add extra choice if حابب توسع بعدين */}
                </div>
              )}

              {q.type === "truefalse" && (
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium">Correct answer</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={q.correctIndex === 0}
                        onChange={() => setCorrectIndex(index, 0)}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={q.correctIndex === 1}
                        onChange={() => setCorrectIndex(index, 1)}
                      />
                      False
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
