import { QuizQuestion } from "../../types/lesson.types";

type Props = {
  question: QuizQuestion;
  index: number;
  onChange: (q: QuizQuestion) => void;
  onRemove: () => void;
};

export function QuizQuestionEditor({
  question,
  index,
  onChange,
  onRemove,
}: Props) {
  const update = (patch: Partial<QuizQuestion>) => {
    onChange({ ...question, ...patch });
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
      <h4>Question {index + 1}</h4>

      <input
        type="text"
        placeholder="Question text"
        value={question.text}
        onChange={(e) => update({ text: e.target.value })}
      />

      {question.choices.map((choice, i) => (
        <div key={i}>
          <input
            type="text"
            placeholder={`Choice ${i + 1}`}
            value={choice}
            onChange={(e) => {
              const next = [...question.choices];
              next[i] = e.target.value;
              update({ choices: next });
            }}
          />
          <input
            type="radio"
            name={`correct-${index}`}
            checked={question.correctIndex === i}
            onChange={() => update({ correctIndex: i })}
          />
          Correct
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          update({
            choices: [...question.choices, ""],
          })
        }
      >
        + Add Choice
      </button>

      <button type="button" onClick={onRemove}>
        Remove Question
      </button>
    </div>
  );
}
