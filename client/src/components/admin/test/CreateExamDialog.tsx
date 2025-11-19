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

export function CreateExamDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [beltLevel, setBeltLevel] = useState("white");
  const [questions, setQuestions] = useState<any[]>([]);

  // ------------------------------
  // Add new question
  // ------------------------------
  const addQuestion = () => {
    setQuestions([
      ...questions,
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

  // ------------------------------
  // Update question
  // ------------------------------
  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // ------------------------------
  // Add MCQ choice
  // ------------------------------
  const addChoice = (index: number) => {
    const updated = [...questions];
    updated[index].choices.push("");
    setQuestions(updated);
  };

  // ------------------------------
  // Create exam (POST)
  // ------------------------------
  const createExam = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const payload = {
      title,
      beltLevel,
      schedule: { startsAt: new Date(), endsAt: new Date() },
      maxTheoryScore: 40,
      createdBy:
        JSON.parse(localStorage.getItem("user") || "{}")?._id ||
        JSON.parse(sessionStorage.getItem("user") || "{}")?._id,

      // format questions for backend
      questions: questions.map((q) => {
        const base = {
          question: q.question,
          type: q.type,
          maxScore: q.maxScore ?? 1,
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

        // Essay
        return {
          ...base,
        };
      }),
    };

    const res = await fetch(
      `https://api-f3rwhuz64a-uc.a.run.app/api/exams/admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    console.log("EXAM CREATED:", data);

    setOpen(false);
    onCreated();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Create New Exam</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Theory Exam</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Exam Title */}
            <Input
              placeholder="Exam Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Belt Level */}
            <Select onValueChange={setBeltLevel} defaultValue="white">
              <SelectTrigger>
                <SelectValue placeholder="Choose Belt Level" />
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

            {/* Add question */}
            <Button variant="outline" onClick={addQuestion}>
              + Add Question
            </Button>

            {/* QUESTIONS */}
            {questions.map((q, i) => (
              <Card key={i} className="p-4 space-y-3">
                {/* QUESTION TEXT */}
                <Input
                  placeholder="Question text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(i, "question", e.target.value)
                  }
                />

                {/* Question Type */}
                <Select
                  onValueChange={(v) => updateQuestion(i, "type", v)}
                  defaultValue={q.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="truefalse">True / False</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>

                {/* MCQ SECTION */}
                {q.type === "mcq" && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Choices</h4>

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

                    <h4 className="font-medium mt-3">Correct Answer</h4>
                    <Select
                      onValueChange={(v) =>
                        updateQuestion(i, "correctIndex", Number(v))
                      }
                      defaultValue={String(q.correctIndex)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Correct Choice" />
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
                )}

                {/* TRUE/FALSE */}
                {q.type === "truefalse" && (
                  <div>
                    <h4 className="font-medium">Correct Answer</h4>
                    <Select
                      onValueChange={(v) =>
                        updateQuestion(i, "correctBoolean", v === "true")
                      }
                      defaultValue={q.correctBoolean ? "true" : "false"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="True or False" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Essay max score */}
                {q.type === "essay" && (
                  <Input
                    placeholder="Max Score"
                    type="number"
                    value={q.maxScore}
                    onChange={(e) =>
                      updateQuestion(i, "maxScore", Number(e.target.value))
                    }
                  />
                )}
              </Card>
            ))}

            <Button onClick={createExam} className="w-full">
              Create Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
