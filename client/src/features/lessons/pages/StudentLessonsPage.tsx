import { useEffect, useState } from "react";
import { getStudentLessons } from "../api/getStudentLessons";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentLessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const res = await getStudentLessons();

    if (res.success) {
      setLessons(res.data.lessons);
      setAttendance(res.data.attendance);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons & Quizzes</CardTitle>
        <CardDescription>
          Complete your lessons and quizzes before attempting belt exams.
        </CardDescription>
      </CardHeader>
      {loading && loading ? (
        <CardContent>
          {" "}
          <p>Loading...</p>{" "}
        </CardContent>
      ) : (
        <CardContent>
          {lessons.map((lesson, index) => {
            const completed = lesson.completed;
            const unlocked = !lesson.locked;
            const lockedReason = lesson.lockedReason;

            return (
              <Card
                key={lesson._id}
                className="border p-4 flex justify-between"
              >
                <div>
                  <h3 className="font-semibold">{lesson.title}</h3>

                  <p className="text-sm text-muted-foreground">
                    {lesson.module?.title} — {lesson.program?.title}
                  </p>

                  {!unlocked && (
                    <p className="text-red-500 text-xs mt-1">
                      🔒 {lockedReason}
                    </p>
                  )}

                  {completed && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completed
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  {unlocked ? (
                    <Button
                      onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle size={18} /> {completed ? "Review" : "Start"}
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
