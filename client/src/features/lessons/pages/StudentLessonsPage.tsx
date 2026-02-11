import { useEffect, useState } from "react";
import { getStudentLessons } from "../api/getStudentLessons";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentLessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const res = await getStudentLessons();

    if (res?.success) {
      setLessons(res.data.lessons || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log(lessons);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons & Quizzes</CardTitle>
        <CardDescription>
          Complete your lessons and quizzes before attempting belt exams.
        </CardDescription>
      </CardHeader>

      {loading ? (
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      ) : (
        <CardContent className="space-y-3">
          {lessons.map((lesson) => {
            const completed = Boolean(lesson.completed);
            const unlocked = !lesson.locked;

            return (
              <Card
                key={lesson._id}
                className="border p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{lesson.title}</h3>

                  <p className="text-sm text-muted-foreground">
                    {lesson.module?.title} — {lesson.program?.title}
                  </p>

                  {lesson.locked && lesson.lockedReason && (
                    <p className="text-red-500 text-xs mt-1">
                      🔒 {lesson.lockedReason}
                    </p>
                  )}

                  {completed && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completed
                    </p>
                  )}
                </div>

                <div>
                  {unlocked ? (
                    <Button
                      onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle size={18} />
                      {completed ? "Review" : "Start"}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Lock size={16} /> Locked
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
