import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const EXAM_API = "https://api-f3rwhuz64a-uc.a.run.app/api/exams";

export function CreateExamDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);

  // Exam fields
  const [title, setTitle] = useState("");
  const [beltLevel, setBeltLevel] = useState("white");
  const [schedule, setSchedule] = useState("");
  const [timeLimit, setTimeLimit] = useState(20);
  const [passMark, setPassMark] = useState(20);
  const [maxTheoryScore, setMaxTheoryScore] = useState(40);

  // Questions
  const [questions, setQuestions] = useState<any[]>([]);

  // Add Question
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        type: "mcq",
        choices: ["", ""],
        correctIndex: 0,
        correctBoolean: true,
        maxScore: 1,
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addChoice = (index: number) => {
    const updated = [...questions];
    updated[index].choices.push("");
    setQuestions(updated);
  };

  // Submit Exam
  const createExam = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !user?._id) {
      alert("You must be logged in.");
      return;
    }

    if (!schedule) {
      alert("Please select exam date & time.");
      return;
    }

    const payload = {
      title,
      beltLevel,
      schedule,
      timeLimit,
      passMark,
      maxTheoryScore,
      createdBy: user._id,

      questions: questions.map((q) => {
        const base = {
          question: q.question,
          type: q.type,
          maxScore: Number(q.maxScore),
        };

        if (q.type === "mcq") {
          return {
            ...base,
            choices: q.choices,
            correctIndex: Number(q.correctIndex),
          };
        }

        if (q.type === "truefalse") {
          return {
            ...base,
            correctBoolean: Boolean(q.correctBoolean),
          };
        }

        return base;
      }),
    };

    const res = await fetch(`${EXAM_API}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Exam Created:", data);

    setOpen(false);
    onCreated?.();

    // Reset form
    setQuestions([]);
    setTitle("");
    setSchedule("");
    setTimeLimit(20);
    setPassMark(20);
    setMaxTheoryScore(40);
    setBeltLevel("white");
  };
  const totalQuestionScore = questions.reduce(
    (sum, q) => sum + (Number(q.maxScore) || 0),
    0
  );
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Create New Exam</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create New Exam
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ========================= */}
            {/* EXAM INFORMATION SECTION */}
            {/* ========================= */}
            <div className="space-y-2">
              <p className="font-semibold text-lg">Exam Information</p>

              {/* Title */}
              <div>
                <label className="text-sm font-medium">Exam Title</label>
                <Input
                  placeholder="e.g., Yellow Belt Theory Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Belt Level */}
              <div>
                <label className="text-sm font-medium">Belt Level</label>
                <p className="text-xs text-muted-foreground mb-1">
                  Which belt is this exam required for?
                </p>

                <Select value={beltLevel} onValueChange={setBeltLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select belt" />
                  </SelectTrigger>
                  <SelectContent>
                    {["white", "yellow", "blue", "brown", "red", "black"].map(
                      (b) => (
                        <SelectItem key={b} value={b}>
                          {b.toUpperCase()} Belt
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-sm font-medium">Exam Date & Time</label>
                <p className="text-xs text-muted-foreground mb-1">
                  When will this exam be available?
                </p>
                <Input
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>
            </div>

            {/* ========================= */}
            {/* EXAM SETTINGS SECTION */}
            {/* ========================= */}
            <div className="space-y-2 mt-6">
              <p className="font-semibold text-lg">Exam Settings</p>

              {/* Time Limit */}
              <div>
                <label className="text-sm font-medium">
                  Time Limit (minutes)
                </label>
                <p className="text-xs text-muted-foreground mb-1">
                  Total time allowed for this exam.
                </p>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                />
              </div>

              {/* Pass Mark */}
              <div>
                <label className="text-sm font-medium">Pass Mark</label>
                <p className="text-xs text-muted-foreground mb-1">
                  Minimum score required to pass the theory exam.
                </p>
                <Input
                  type="number"
                  value={passMark}
                  onChange={(e) => setPassMark(Number(e.target.value))}
                />
              </div>

              {/* Max Theory Score */}
              <div>
                <label className="text-sm font-medium">Max Theory Score</label>
                <p className="text-xs text-muted-foreground mb-1">
                  Total possible points from theory questions.
                </p>
                <Input
                  type="number"
                  value={maxTheoryScore}
                  onChange={(e) => setMaxTheoryScore(Number(e.target.value))}
                />
              </div>
            </div>

            {/* ========================= */}
            {/* QUESTIONS SECTION */}
            {/* ========================= */}
            <div className="space-y-2 mt-6">
              <p className="font-semibold text-lg">Questions</p>

              <Button variant="outline" onClick={addQuestion}>
                + Add Question
              </Button>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <Card key={i} className="p-4 space-y-3 border">
                    {/* Question Text */}
                    <div>
                      <label className="text-sm font-medium">
                        Question Text
                      </label>
                      <Input
                        placeholder="Enter question here..."
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(i, "question", e.target.value)
                        }
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="text-sm font-medium">
                        Question Type
                      </label>
                      <Select
                        value={q.type}
                        onValueChange={(v) => updateQuestion(i, "type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="truefalse">
                            True / False
                          </SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* MCQ */}
                    {q.type === "mcq" && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Choices</label>

                        {q.choices.map((c: string, idx: number) => (
                          <Input
                            key={idx}
                            placeholder={`Choice ${idx + 1}`}
                            value={c}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i].choices[idx] = e.target.value;
                              setQuestions(updated);
                            }}
                          />
                        ))}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addChoice(i)}
                        >
                          + Add Choice
                        </Button>

                        {/* Correct Index */}
                        <div>
                          <label className="text-sm font-medium mt-3">
                            Correct Answer
                          </label>
                          <Select
                            value={String(q.correctIndex)}
                            onValueChange={(v) =>
                              updateQuestion(i, "correctIndex", Number(v))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {q.choices.map((_: string, idx: number) => (
                                <SelectItem key={idx} value={String(idx)}>
                                  Choice {idx + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Max Score */}
                        <div>
                          <label className="text-sm font-medium">
                            Question Score
                          </label>
                          <Input
                            type="number"
                            value={q.maxScore}
                            onChange={(e) =>
                              updateQuestion(
                                i,
                                "maxScore",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* TRUE/FALSE */}
                    {q.type === "truefalse" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Correct Answer
                        </label>
                        <Select
                          value={q.correctBoolean ? "true" : "false"}
                          onValueChange={(v) =>
                            updateQuestion(i, "correctBoolean", v === "true")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>

                        <label className="text-sm font-medium">
                          Question Score
                        </label>
                        <Input
                          type="number"
                          value={q.maxScore}
                          onChange={(e) =>
                            updateQuestion(
                              i,
                              "maxScore",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    )}

                    {/* ESSAY */}
                    {q.type === "essay" && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Max Score</label>
                        <Input
                          type="number"
                          value={q.maxScore}
                          onChange={(e) =>
                            updateQuestion(
                              i,
                              "maxScore",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Total points from questions:{" "}
                      <strong>{totalQuestionScore}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max Theory Score (exam): <strong>{maxTheoryScore}</strong>
                      {totalQuestionScore !== maxTheoryScore && (
                        <span className="text-red-500 ml-2">
                          ⚠ Mismatch – exam max score ≠ sum of questions
                        </span>
                      )}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <Button onClick={createExam} className="w-full">
              Create Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
