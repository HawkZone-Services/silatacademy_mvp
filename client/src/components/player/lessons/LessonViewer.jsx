import { useEffect, useState } from "react";
import Quiz from "./Quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import lessonService from "@/services/lessonService";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function LessonViewer({ lessonId, onCompleted }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState(0);
  const { toast } = useToast();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId || !token) return;
      setLoading(true);
      try {
        const res = await lessonService.getLesson(lessonId);
        const data = await res.json();
        setLesson(data.lesson);
        setPosition(data.lesson?.progress?.positionSeconds || 0);
      } catch (err) {
        console.error("Lesson fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, token]);

  const saveProgress = async (payload) => {
    if (!lessonId || !token) return;
    setSaving(true);
    try {
      const res = await lessonService.saveProgress(lessonId, payload);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Could not save progress");
      }
      setLesson((prev) => ({
        ...prev,
        progress: data.progress,
      }));
      if (payload.completed || data.progress?.completed) {
        onCompleted?.(data.progress);
      }
      toast({
        title: "Progress saved",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err.message || "Could not save progress",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !lesson) {
    return <p className="text-muted-foreground">Loading lesson...</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{lesson.summary}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.videoUrl && (
            <div className="aspect-video bg-black/5 rounded-lg overflow-hidden">
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={lesson.title}
                onLoad={() => {
                  // placeholder: video position tracking would hook into player API
                }}
              />
            </div>
          )}

          {lesson.content && (
            <div className="prose prose-sm max-w-none">
              {lesson.content}
            </div>
          )}

          {lesson.technicalContent && (
            <div>
              <p className="font-semibold mb-2">Technical Content</p>
              <div className="prose prose-sm max-w-none">
                {lesson.technicalContent}
              </div>
            </div>
          )}

          {lesson.medicalContent && (
            <div>
              <p className="font-semibold mb-2">Medical Content</p>
              <div className="prose prose-sm max-w-none">
                {lesson.medicalContent}
              </div>
            </div>
          )}

          {lesson.psychologyContent && (
            <div>
              <p className="font-semibold mb-2">Psychology Content</p>
              <div className="prose prose-sm max-w-none">
                {lesson.psychologyContent}
              </div>
            </div>
          )}

          {Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Resources</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {lesson.resources.map((res, idx) => (
                  <li key={idx}>
                    <a
                      className="text-primary underline"
                      href={res}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {res}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => saveProgress({ positionSeconds: position })}
            >
              {saving ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {Array.isArray(lesson.quiz) && lesson.quiz.length > 0 && (
        <Quiz
          questions={lesson.quiz}
          initialAnswers={lesson.progress?.quizAnswers}
          onSubmit={(answers) =>
            saveProgress({ quizAnswers: answers, completed: true })
          }
        />
      )}
    </div>
  );
}
