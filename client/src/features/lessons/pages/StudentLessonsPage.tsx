import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudentLessons } from "../api/getStudentLessons";
import { LessonList } from "../components/LessonList";
import { Badge } from "@/components/ui/badge";

export default function StudentLessonsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(["student-lessons"], getStudentLessons);
  const lessons = data?.data?.lessons || data?.data?.items || data?.items || data?.data || [];

  if (isLoading) return <div className="p-6">Loading lessons...</div>;

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">My Lessons</h1>
      <div className="grid gap-3">
        {lessons.map((lesson: any) => {
          const locked = lesson.locked || lesson.isEligible === false;
          const reason = lesson.lockedReason || lesson.reasonIfNotEligible;

          return (
            <div
              key={lesson._id}
              className={`p-4 border rounded-lg bg-accent/10 flex items-center justify-between ${
                locked ? "opacity-70" : ""
              }`}
            >
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {lesson.title}
                  {lesson.completed && (
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                  )}
                  {locked && (
                    <Badge variant="destructive" className="text-xs">
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {lesson.programLevel
                    ? `${lesson.programLevel.toUpperCase()} level`
                    : "Training lesson"}
                </p>
                {locked && reason && (
                  <p className="text-xs text-red-600 mt-1">{reason}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="text-primary text-sm"
                  disabled={locked}
                  onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                >
                  View
                </button>
                <button
                  className="text-primary text-sm"
                  disabled={locked}
                  onClick={() => navigate(`/student/lessons/${lesson._id}/quiz`)}
                >
                  Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
