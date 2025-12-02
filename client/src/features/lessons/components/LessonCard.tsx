import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LessonCardProps = {
  lesson: any;
  onSelect?: (lesson: any) => void;
};

export function LessonCard({ lesson, onSelect }: LessonCardProps) {
  return (
    <Card
      className="border-border/40 cursor-pointer"
      onClick={() => onSelect?.(lesson)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {lesson.title}
          {lesson.beltLevel && (
            <Badge variant="outline" className="capitalize text-xs">
              {lesson.beltLevel}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {lesson.summary || "Lesson details"}
      </CardContent>
    </Card>
  );
}
