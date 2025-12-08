import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle, PlayCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LearningPathSection({ lessons = [] }) {
  const navigate = useNavigate();

  if (!lessons.length) {
    return (
      <p className="text-sm text-muted-foreground">No lessons available yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const locked = lesson.locked || lesson.isEligible === false;

        const reason =
          lesson.reasonIfNotEligible ||
          lesson.lockedReason ||
          lesson.lockReason ||
          null;

        return (
          <div
            key={lesson._id}
            className="border rounded-lg p-4 flex items-center justify-between bg-accent/5"
          >
            {/* LEFT SECTION */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {lesson.title}

                {lesson.completed && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600 flex items-center gap-1"
                  >
                    <CheckCircle size={14} /> Completed
                  </Badge>
                )}

                {locked && (
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-600 flex items-center gap-1"
                  >
                    <Lock size={14} /> Locked
                  </Badge>
                )}
              </h3>

              {reason && <p className="text-xs text-red-500 mt-1">{reason}</p>}
            </div>

            {/* RIGHT ACTION BUTTONS */}
            <div className="flex gap-2">
              {/* View Lesson */}
              <Button
                size="sm"
                variant="outline"
                disabled={locked}
                onClick={() => navigate(`/student/lessons/${lesson._id}`)}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                View Lesson
              </Button>

              {/* Take Quiz */}
              {lesson.quizAvailable && (
                <Button
                  size="sm"
                  disabled={locked}
                  onClick={() =>
                    navigate(`/student/lessons/${lesson._id}/quiz`)
                  }
                >
                  <PlayCircle className="w-4 h-4 mr-1" />
                  {lesson.quizCompleted ? "Review Quiz" : "Take Quiz"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
