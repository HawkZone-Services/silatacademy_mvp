import { AssignmentStatusCard } from "../components/LessonPlayer/AssignmentStatusCard";
import { CompleteLessonButton } from "../components/LessonPlayer/CompleteLessonButton";
import { LessonQuiz } from "../components/LessonPlayer/LessonQuiz";
import { LessonStepper } from "../components/LessonPlayer/LessonStepper";
import { useCompleteLesson } from "../hooks/useCompleteLesson";
import { useLessonPlayer } from "../hooks/useLessonPlayer";
import { useLessonQuiz } from "../hooks/useLessonQuiz";
import { Lesson } from "../types/lesson.types";

export function LessonPlayerPage({ lesson }: { lesson: Lesson }) {
  const {
    progress,
    completeStep,
    error: stepError,
  } = useLessonPlayer({ lesson });
  const {
    completeLesson,
    loading: completing,
    error: completeError,
  } = useCompleteLesson(lesson._id);
  const {
    submitQuiz,
    loading: quizLoading,
    result,
    error: quizError,
  } = useLessonQuiz({
    lessonId: lesson._id,
  });
  const handleCompleteLesson = async () => {
    const updated = await completeLesson();
    // update local progress
    // (backend returns final progress)
  };
  const handleAssignmentSubmit = () => {
    alert("Assignment submission will be implemented later.");
  };

  if (!progress) return null;
  return (
    <div>
      <LessonStepper
        lesson={lesson}
        progress={progress}
        onStepClick={(step) => completeStep(step as any)}
      />

      {/* Quiz يظهر فقط لو وصل له */}
      {progress?.safetyCompleted && !progress?.quickCheckPassed && (
        <LessonQuiz
          questions={lesson.quiz}
          onSubmit={submitQuiz}
          loading={quizLoading}
        />
      )}

      {/* Result */}
      {result && (
        <div>
          <p>Score: {result.score}%</p>
          {!result.passed && (
            <p style={{ color: "red" }}>You did not pass. Please retry.</p>
          )}
        </div>
      )}
      {result && !result.passed && (
        <div style={{ color: "red", marginTop: 12 }}>
          <p>You did not pass the quiz.</p>
          <p>Please review the lesson and try again.</p>
        </div>
      )}

      {quizError && <p style={{ color: "red" }}>{quizError}</p>}
      {stepError && <p style={{ color: "red" }}>{stepError}</p>}

      {progress.assignmentRequired && (
        <AssignmentStatusCard
          required
          status={progress.assignmentStatus}
          onSubmit={handleAssignmentSubmit}
        />
      )}

      {progress && (
        <CompleteLessonButton
          progress={progress}
          onComplete={handleCompleteLesson}
          loading={completing}
        />
      )}

      {completeError && <p style={{ color: "red" }}>{completeError}</p>}
    </div>
  );
}
