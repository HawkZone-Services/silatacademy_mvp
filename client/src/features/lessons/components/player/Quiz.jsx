import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Button } from "@/shared/ui/button";

export default function Quiz({ questions = [], initialAnswers = [], onSubmit }) {
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const mapped = {};
    (initialAnswers || []).forEach((ans) => {
      mapped[ans.questionIndex] = ans.selectedIndex;
    });
    setAnswers(mapped);
  }, [initialAnswers]);

  if (!questions.length) return null;

  const handleSubmit = () => {
    const formatted = questions.map((_, idx) => ({
      questionIndex: idx,
      selectedIndex:
        answers[idx] !== undefined ? Number(answers[idx]) : undefined,
    }));
    onSubmit?.(formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lesson Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="border rounded-lg p-3 space-y-2">
            <p className="font-semibold text-sm">
              Q{idx + 1}. {q.prompt}
            </p>
            <RadioGroup
              onValueChange={(v) =>
                setAnswers((prev) => ({ ...prev, [idx]: v }))
              }
              value={
                answers[idx] !== undefined ? String(answers[idx]) : undefined
              }
            >
              {q.options?.map((opt, oi) => (
                <div key={oi} className="flex items-center space-x-2">
                  <RadioGroupItem id={`q-${idx}-${oi}`} value={String(oi)} />
                  <label htmlFor={`q-${idx}-${oi}`}>{opt}</label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <Button className="w-full" onClick={handleSubmit}>
          Submit Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
