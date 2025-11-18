import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "mcq",
        choices: ["", ""],
        correctIndex: 0,
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

  const createExam = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    console.log("USED TOKEN:", token);

    const payload = {
      title,
      beltLevel,
      questions: questions.map((q) => ({
        ...q,
        maxScore: q.maxScore ?? 1,
      })),
      schedule: {
        startsAt: new Date(),
        endsAt: new Date(),
      },
      maxTheoryScore: 40,
      createdBy: JSON.parse(localStorage.getItem("user") || "{}")?._id,
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
            <Input
              placeholder="Exam Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

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

            <Button variant="outline" onClick={addQuestion}>
              + Add Question
            </Button>

            {questions.map((q, i) => (
              <Card key={i} className="p-4 space-y-3">
                <Input
                  placeholder="Question text"
                  value={q.text}
                  onChange={(e) => updateQuestion(i, "text", e.target.value)}
                />

                {/* Question Type */}
                <Select
                  onValueChange={(v) => updateQuestion(i, "type", v)}
                  defaultValue={q.type}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="truefalse">True / False</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>

                {/* MCQ */}
                {q.type === "mcq" && (
                  <div className="space-y-2">
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
                  </div>
                )}

                {/* True/False */}
                {q.type === "truefalse" && (
                  <Select
                    onValueChange={(v) =>
                      updateQuestion(i, "correctBoolean", v === "true")
                    }
                    defaultValue="true"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Essay Score */}
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
