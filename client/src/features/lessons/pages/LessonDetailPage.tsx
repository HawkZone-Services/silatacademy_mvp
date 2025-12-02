import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLessonById } from "../api/getLessonById";
import { LessonContent } from "../components/LessonContent";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeLesson } from "../api/completeLesson";

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(["lesson", lessonId], () =>
    getLessonById(lessonId as string)
  );
  const lesson = data?.data?.lesson || data?.data;

  const completeMutation = useMutation(
    () => completeLesson(lessonId as string, {}),
    {
      onSuccess: () => {
        qc.invalidateQueries(["student-lessons"]);
        navigate(-1);
      },
    }
  );

  if (isLoading) return <div className="p-6">Loading lesson...</div>;
  if (!lesson) return <div className="p-6">Lesson not found.</div>;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/student/lessons/${lesson._id}/quiz`)}>
            Take Quiz
          </Button>
          <Button
            disabled={completeMutation.isLoading}
            onClick={() => completeMutation.mutate()}
          >
            {completeMutation.isLoading ? "Completing..." : "Mark Complete"}
          </Button>
        </div>
      </div>
      <LessonContent lesson={lesson} />
    </div>
  );
}
