import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import lessonService from "@/services/lessonService";

export default function LessonList({ onSelect }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await lessonService.getLessons();
        const data = await res.json();
        if (Array.isArray(data.lessons)) {
          setLessons(data.lessons);
        }
      } catch (err) {
        console.error("Lessons fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchLessons();
  }, [token]);

  if (loading) {
    return <p className="text-muted-foreground">Loading lessons...</p>;
  }

  if (!lessons.length) {
    return <p className="text-muted-foreground">No lessons available.</p>;
  }

  return (
    <div className="grid gap-3">
      {lessons.map((lesson) => {
        const progress = lesson.progress;
        const isDone = progress?.completed;
        return (
          <Card
            key={lesson._id}
            className="p-4 flex items-center justify-between hover:bg-accent/10 transition"
          >
            <div className="space-y-1">
              <p className="font-semibold">{lesson.title}</p>
              <p className="text-sm text-muted-foreground">
                {lesson.summary || "No description"}
              </p>
              <div className="flex items-center gap-2">
                {lesson.program?.level && (
                  <Badge variant="outline" className="capitalize">
                    {lesson.program.level}
                  </Badge>
                )}
                {isDone && <Badge variant="secondary">Completed</Badge>}
                {progress?.quizScore >= 0 && (
                  <Badge variant="outline">Quiz: {progress.quizScore}%</Badge>
                )}
              </div>
            </div>
            <Button onClick={() => onSelect?.(lesson._id)}>
              {isDone ? "Review" : progress ? "Continue" : "Start"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
