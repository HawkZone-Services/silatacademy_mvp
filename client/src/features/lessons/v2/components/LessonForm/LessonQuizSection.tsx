import { QuizQuestionEditor } from "./QuizQuestionEditor";
import { LessonFormState } from "../../hooks/useLessonForm";
import { QuizQuestion } from "../../types/lesson.types";

type Props = {
  state: LessonFormState;
  updateField: <K extends keyof LessonFormState>(
    key: K,
    value: LessonFormState[K]
  ) => void;
};

export function LessonQuizSection({ state, updateField }: Props) {
  const questions = state.quiz;

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      text: "",
      choices: ["", ""],
      correctIndex: 0,
    };

    updateField("quiz", [...questions, newQuestion]);
  };

  const updateQuestion = (index: number, q: QuizQuestion) => {
    const next = [...questions];
    next[index] = q;
    updateField("quiz", next);
  };

  const removeQuestion = (index: number) => {
    const next = questions.filter((_, i) => i !== index);
    updateField("quiz", next);
  };

  return (
    <section>
      <h3>Quick Check (Quiz)</h3>

      {questions.length === 0 && (
        <p style={{ color: "orange" }}>⚠️ At least one question is required.</p>
      )}

      {questions.map((q, i) => (
        <QuizQuestionEditor
          key={i}
          index={i}
          question={q}
          onChange={(updated) => updateQuestion(i, updated)}
          onRemove={() => removeQuestion(i)}
        />
      ))}

      <button type="button" onClick={addQuestion}>
        + Add Question
      </button>
    </section>
  );
}
