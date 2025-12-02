type LessonContentProps = {
  lesson: any;
};

export function LessonContent({ lesson }: LessonContentProps) {
  if (!lesson) return null;
  return (
    <div className="space-y-4">
      <div className="prose max-w-none">{lesson.content}</div>
      {lesson.technicalContent && (
        <div>
          <p className="font-semibold mb-1">Technical Content</p>
          <div className="prose max-w-none">{lesson.technicalContent}</div>
        </div>
      )}
      {lesson.resources?.length ? (
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          {lesson.resources.map((r: string, idx: number) => (
            <li key={idx}>
              <a className="text-primary underline" href={r} target="_blank" rel="noreferrer">
                {r}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
