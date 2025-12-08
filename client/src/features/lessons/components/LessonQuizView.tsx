// src/features/lessons/components/LessonQuizView.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LessonQuizPayload, LessonQuizQuestion } from "../types/lesson.types";

type LessonQuizViewProps = {
  quiz: LessonQuizPayload;
  answers: Record<number, any>; // key: questionIndex
  onChange: (index: number, value: any) => void;
  onSubmit: () => void;
  submitting?: boolean;
};

export function LessonQuizView({
  quiz,
  answers,
  onChange,
  onSubmit,
  submitting,
}: LessonQuizViewProps) {
  if (!quiz?.questions?.length) return <p>No quiz for this lesson.</p>;

  return (
    <div className="space-y-4">
      {quiz.questions.map((q: LessonQuizQuestion, idx) => (
        <div
          key={q._id || idx}
          className="p-4 border rounded-lg bg-accent/10 space-y-3"
        >
          <div className="font-semibold">
            Q{idx + 1}. {q.question}
          </div>

          {q.type === "mcq" && q.choices && (
            <RadioGroup
              onValueChange={(val) => onChange(idx, val)}
              value={answers[idx]}
            >
              {q.choices.map((choice, i) => (
                <div className="flex items-center space-x-2" key={i}>
                  <RadioGroupItem value={String(i)} />
                  <label>{choice}</label>
                </div>
              ))}
            </RadioGroup>
          )}

          {q.type === "truefalse" && (
            <RadioGroup
              onValueChange={(val) => onChange(idx, val)}
              value={answers[idx]}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" />
                <label>True</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" />
                <label>False</label>
              </div>
            </RadioGroup>
          )}

          {q.type === "essay" && (
            <Textarea
              placeholder="Write your answer..."
              value={answers[idx] || ""}
              onChange={(e) => onChange(idx, e.target.value)}
            />
          )}
        </div>
      ))}

      <Button className="w-full" onClick={onSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Quiz"}
      </Button>
    </div>
  );
}
