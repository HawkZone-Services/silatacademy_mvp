// src/features/lessons/components/LessonCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LessonWithEligibility } from "../types/lesson.types";

type LessonCardProps = {
  lesson: LessonWithEligibility;
  onClick?: () => void;
};

export function LessonCard({ lesson, onClick }: LessonCardProps) {
  const locked = lesson.locked || lesson.isEligible === false;
  const completed = lesson.progress?.completed;

  return (
    <Card
      className={`border-border/40 cursor-pointer ${
        locked ? "opacity-75" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {lesson.title}
          {completed && (
            <Badge variant="outline" className="text-xs">
              Completed
            </Badge>
          )}
          {locked && (
            <Badge variant="destructive" className="text-xs">
              Locked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        <p>{lesson.summary || "Training lesson"}</p>
        {lesson.program && (
          <p className="text-xs">
            Program: {lesson.program.title}{" "}
            {lesson.program.level && `• ${lesson.program.level}`}
          </p>
        )}
        {lesson.progress?.quizScore !== undefined && (
          <p className="text-xs">Quiz score: {lesson.progress.quizScore}%</p>
        )}
        {locked && lesson.lockedReason && (
          <p className="text-xs text-red-600">{lesson.lockedReason}</p>
        )}
      </CardContent>
    </Card>
  );
}
