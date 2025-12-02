import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getLessonQuiz } from "../api/getLessonQuiz";
import { submitQuizAnswers } from "../api/submitQuizAnswers";
import { completeLesson } from "../api/completeLesson";
import { LessonQuizView } from "../components/LessonQuizView";
import { useToast } from "@/hooks/use-toast";

export default function LessonQuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery(["lesson-quiz", lessonId], () =>
    getLessonQuiz(lessonId as string)
  );
  const quiz = data?.data?.quiz || data?.data;

  const submitMutation = useMutation(async () => {
    const formatted =
      quiz?.questions?.map((q: any, idx: number) => ({
        questionIndex: idx,
        selectedIndex:
          answers[q._id] !== undefined ? Number(answers[q._id]) : undefined,
      })) || [];
    return submitQuizAnswers(lessonId as string, { answers: formatted });
  }, {
    onSuccess: async (res) => {
      const score = res?.data?.score ?? res?.data?.quizScore;
      toast({
        title: "Quiz submitted",
        description: score !== undefined ? `Score: ${score}` : undefined,
      });
      await completeLesson(lessonId as string, {
        quizScore: score,
        passed: score ? score >= 60 : true,
      });
      navigate(-1);
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Quiz submission failed",
      }),
  });

  const handleChange = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  if (isLoading) return <div className="p-6">Loading quiz...</div>;
  if (!quiz) return <div className="p-6">Quiz not found.</div>;

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">{quiz.title || "Lesson Quiz"}</h1>
      <LessonQuizView
        quiz={quiz}
        answers={answers}
        onChange={handleChange}
        onSubmit={() => submitMutation.mutate()}
        submitting={submitMutation.isLoading}
      />
    </div>
  );
}
