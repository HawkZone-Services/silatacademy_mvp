// src/features/lessons/components/LessonContent.tsx
import { LessonBase } from "../types/lesson.types";

type LessonContentProps = {
  lesson: LessonBase;
};

export function LessonContent({ lesson }: LessonContentProps) {
  if (!lesson) return null;

  return (
    <div className="space-y-6">
      {lesson.content && (
        <div className="prose max-w-none">{lesson.content}</div>
      )}

      {lesson.technicalContent && (
        <section>
          <p className="font-semibold mb-1">Technical Content</p>
          <div className="prose max-w-none">{lesson.technicalContent}</div>
        </section>
      )}

      {lesson.medicalContent && (
        <section>
          <p className="font-semibold mb-1">Medical Content</p>
          <div className="prose max-w-none">{lesson.medicalContent}</div>
        </section>
      )}

      {lesson.psychologyContent && (
        <section>
          <p className="font-semibold mb-1">Psychology Content</p>
          <div className="prose max-w-none">{lesson.psychologyContent}</div>
        </section>
      )}

      {lesson.resources?.length ? (
        <section>
          <p className="font-semibold mb-1">Resources</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {lesson.resources.map((r, idx) => (
              <li key={idx}>
                <a
                  className="text-primary underline"
                  href={r}
                  target="_blank"
                  rel="noreferrer"
                >
                  {r}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
