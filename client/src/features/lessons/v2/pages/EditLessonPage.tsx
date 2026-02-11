import { useEffect, useState } from "react";
import { LessonsV2API } from "../api/lessons.api";
import { Lesson } from "../types/lesson.types";
import { LessonForm } from "../components/LessonForm/LessonForm";

type Props = {
  lessonId: string;
  onDone?: () => void;
};

export function EditLessonPage({ lessonId, onDone }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    LessonsV2API.getLessonById(lessonId)
      .then((data) => setLesson(data))
      .catch(() => setError("Failed to load lesson"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return <div>Loading lesson...</div>;
  if (error) return <div>{error}</div>;
  if (!lesson) return null;

  return (
    <LessonForm
      mode="edit"
      initialData={lesson}
      onSuccess={() => onDone?.()}
      onCancel={onDone}
    />
  );
}
