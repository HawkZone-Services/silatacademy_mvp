import { useState } from "react";
import { QuizQuestion } from "../../types/lesson.types";

type Props = {
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => void;
  loading?: boolean;
};

export function LessonQuiz({ questions, onSubmit, loading }: Props) {
  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );

  const handleSelect = (qIndex: number, choiceIndex: number) => {
    const next = [...answers];
    next[qIndex] = choiceIndex;
    setAnswers(next);
  };

  const canSubmit = answers.every((a) => a !== -1);

  return (
    <div>
      <h3>Quick Check</h3>

      {questions.map((q, qi) => (
        <div key={qi}>
          <p>{q.text}</p>

          {q.choices.map((c, ci) => (
            <label key={ci}>
              <input
                type="radio"
                name={`q-${qi}`}
                checked={answers[qi] === ci}
                onChange={() => handleSelect(qi, ci)}
              />
              {c}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={() => onSubmit(answers)}
        disabled={!canSubmit || loading}
      >
        Submit Quiz
      </button>
    </div>
  );
}
