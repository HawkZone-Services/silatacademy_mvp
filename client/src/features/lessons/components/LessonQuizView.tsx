import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type LessonQuizViewProps = {
  quiz: any;
  answers: Record<string, any>;
  onChange: (id: string, value: any) => void;
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
  if (!quiz) return null;
  return (
    <div className="space-y-4">
      {quiz.questions?.map((q: any, idx: number) => (
        <div key={q._id} className="p-4 border rounded-lg bg-accent/10 space-y-3">
          <div className="font-semibold">
            Q{idx + 1}. {q.question}
          </div>
          {q.type === "mcq" && (
            <RadioGroup
              onValueChange={(val) => onChange(q._id, val)}
              value={answers[q._id]}
            >
              {q.choices.map((choice: string, i: number) => (
                <div className="flex items-center space-x-2" key={i}>
                  <RadioGroupItem value={String(i)} />
                  <label>{choice}</label>
                </div>
              ))}
            </RadioGroup>
          )}
          {q.type === "truefalse" && (
            <RadioGroup onValueChange={(val) => onChange(q._id, val)} value={answers[q._id]}>
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
              value={answers[q._id] || ""}
              onChange={(e) => onChange(q._id, e.target.value)}
            />
          )}
        </div>
      ))}
      <Button className="w-full" onClick={onSubmit} disabled={submitting}>
        Submit Quiz
      </Button>
    </div>
  );
}
