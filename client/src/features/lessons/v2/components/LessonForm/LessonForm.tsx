import { Lesson } from "../../types/lesson.types";
import { useLessonForm } from "../../hooks/useLessonForm";
import { LessonContextSection } from "./LessonContextSection";
import { useLessonSubmit } from "../../hooks/useLessonSubmit";
import { LessonFormActions } from "./LessonFormActions";
import { LessonQuizSection } from "./LessonQuizSection";
import { useLessonValidation } from "../../hooks/useLessonValidation";

/**
 * LessonForm (V2)
 *
 * Structure:
 * <LessonForm>
 *  ├─ <LessonContextSection />
 *  ├─ <LessonInfoSection />
 *  ├─ <LessonContentSection />
 *  ├─ <LessonResourcesSection />
 *  ├─ <LessonQuizSection />
 *  └─ <LessonFormActions />
 */
type LessonFormProps = {
  mode: "create" | "edit";
  initialData?: Lesson;
  onSuccess?: (lessonId: string) => void;
  onCancel?: () => void;
};

export function LessonForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: LessonFormProps) {
  const { state, updateField, isEditMode, isDirty } = useLessonForm({
    mode,
    initialData,
  });
  const { submit, loading, error } = useLessonSubmit({
    mode,
    lessonId: initialData?._id,
    onSuccess,
  });
  const { validate } = useLessonValidation();

  const handleSave = async () => {
    const result = validate(state);

    if (!result.isValid) {
      // TODO: show inline errors (next phase)
      console.warn("Validation errors", result.errors);
      return;
    }

    try {
      await submit(state);
    } catch {
      // error already handled
    }
  };
  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }

    onCancel?.();
  };

  return (
    <div>
      {/* LESSON CONTEXT */}
      <LessonContextSection
        state={state}
        updateField={updateField}
        isEditMode={isEditMode}
      />

      {/* BASIC INFO */}
      {/* <LessonInfoSection /> */}

      {/* CONTENT */}
      {/* <LessonContentSection /> */}

      {/* RESOURCES */}
      {/* <LessonResourcesSection /> */}

      {/* QUIZ */}
      <LessonQuizSection state={state} updateField={updateField} />
      {/* Warnings */}
      {/* (UI styling later) */}
      {/* result.warnings.map(...) */}
      {/* ACTIONS */}
      <LessonFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        disabled={loading}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Temporary debug */}
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
