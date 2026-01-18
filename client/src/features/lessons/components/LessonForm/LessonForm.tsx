import React from "react";
import { Lesson } from "../../types/lesson.types";

/**
 * LessonForm Structure
 *
 * <LessonForm>
 *  ├─ <LessonContextSection />
 *  ├─ <LessonInfoSection />
 *  ├─ <LessonContentSection />
 *  ├─ <LessonResourcesSection />
 *  ├─ <LessonQuizSection />
 *  └─ <LessonFormActions />
 */

export type LessonFormProps = {
  mode: "create" | "edit";
  initialData?: Lesson;
  onSuccess?: (lessonId: string) => void;
  onCancel?: () => void;
};

const LessonForm = () => {
  return (
    <div>
      <button onClick={submit}>Save</button>
    </div>
  );
};

export default LessonForm;
