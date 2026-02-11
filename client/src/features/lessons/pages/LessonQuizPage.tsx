// src/features/lessons/pages/LessonQuizPage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardHeader, CardContent, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

import { getLessonQuiz } from "../api/getLessonQuiz";
import { submitLessonQuiz } from "../api/submitQuizAnswers";

export default function LessonQuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<any>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  /* ============================
        Fetch Quiz
  ============================= */
  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await getLessonQuiz(lessonId);
      const data = res?.data?.lesson || res?.lesson || res?.data || res || null;

      console.log("Quiz loaded:", data);

      // normalize quiz: ensure it's an array and filter out broken questions
      const rawQuiz = Array.isArray(data?.quiz) ? data.quiz : [];
      const normalizedQuiz = rawQuiz
        .map((q: any) => ({
          ...q,
          options: Array.isArray(q?.options)
            ? q.options
            : Array.isArray(q?.choices)
            ? q.choices
            : [],
        }))
        .filter((q: any) => q.options.length > 0);

      const normalizedLesson = { ...data, quiz: normalizedQuiz };

      setLesson(normalizedLesson);
      setAnswers(new Array(normalizedQuiz.length).fill(null));
      setCurrentIndex(0);
      setSubmitted(false);
      setResult(null);
      setValidationError(null);
    } catch (error) {
      console.error("Quiz load error:", error);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const quiz = lesson?.quiz ?? [];
  const totalQuestions = quiz.length;
  const currentQuestion = totalQuestions > 0 ? quiz[currentIndex] : null;

  /* ============================
        Select Answer
  ============================= */
  const handleSelect = (optionIndex: number) => {
    if (submitted) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    setValidationError(null);
  };

  /* ============================
        Submit Quiz
  ============================= */
  const handleSubmit = async () => {
    if (!lessonId) return;

    // Ensure all questions answered
    if (answers.some((a) => a === null)) {
      setValidationError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setValidationError(null);

      const payload = {
        answers: answers.map((a, idx) => ({
          questionIndex: idx,
          selectedIndex: a,
        })),
      };

      const res = await submitLessonQuiz(lessonId, payload);
      setSubmitted(true);
      setResult(res?.data || res);

      // لو نجح → أظهر الاحتفال ثم اعمل redirect بعد 2 ثانية
      if (res?.data?.passed || res?.passed) {
        setShowCelebration(true);
        setTimeout(() => {
          navigate("/student-dashboard"); // غيرها حسب المسار عندك
        }, 3000);
      }

      console.log("Quiz submit result:", res);
    } catch (err) {
      console.error("Quiz submit error:", err);
      setValidationError("An error occurred while submitting the quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================
        Navigation: Next / Back
  ============================= */
  const handleNext = () => {
    if (!currentQuestion) return;

    // require answer for current question
    if (answers[currentIndex] === null && !submitted) {
      setValidationError("Please select an answer before continuing.");
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setValidationError(null);
    } else if (!submitted) {
      // last question → submit
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setValidationError(null);
    }
  };

  const score = result?.score;
  const passed = result?.passed;

  /* ============================
        RENDER
  ============================= */
  return (
    <div className="container max-w-3xl py-10 space-y-6">
      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          Loading quiz...
        </div>
      )}

      {/* NO QUIZ / ERROR */}
      {!loading && (!lesson || totalQuestions === 0) && (
        <div className="text-center py-20">
          <p className="text-lg mb-4">
            This lesson has no valid quiz questions.
          </p>

          <Button className="mt-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>
      )}

      {/* MAIN QUIZ VIEW */}
      {!loading && lesson && totalQuestions > 0 && (
        <>
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{lesson.title} — Quiz</span>

                {submitted && (
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${
                      passed
                        ? "text-green-600 border-green-600"
                        : "text-red-600 border-red-600"
                    }`}
                  >
                    {passed ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {passed ? "Passed" : "Failed"} ({score}%)
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span>
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              {submitted && (
                <span className="text-muted-foreground">Score: {score}%</span>
              )}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          {currentQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Q{currentIndex + 1}. {currentQuestion.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {Array.isArray(currentQuestion.options) &&
                  currentQuestion.options.map(
                    (opt: string, optIndex: number) => {
                      const selected = answers[currentIndex];
                      const isSelected = selected === optIndex;
                      const isCorrect =
                        submitted && optIndex === currentQuestion.correctIndex;
                      const isWrong =
                        submitted &&
                        isSelected &&
                        optIndex !== currentQuestion.correctIndex;

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelect(optIndex)}
                          disabled={submitted}
                          className={`w-full text-left p-3 rounded-lg border transition
                            ${
                              isSelected && !submitted
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300"
                            }
                            ${
                              submitted && isCorrect
                                ? "border-green-600 bg-green-50"
                                : ""
                            }
                            ${
                              submitted && isWrong
                                ? "border-red-600 bg-red-50"
                                : ""
                            }
                          `}
                        >
                          {opt}
                        </button>
                      );
                    }
                  )}

                {!Array.isArray(currentQuestion.options) && (
                  <p className="text-sm text-red-500">
                    ⚠ This question has no options defined.
                  </p>
                )}

                {validationError && (
                  <p className="text-sm text-red-600 mt-2">{validationError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* RESULT SUMMARY (after submit) */}
          {submitted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {passed ? (
                    <CheckCircle2 className="text-green-600" size={18} />
                  ) : (
                    <XCircle className="text-red-600" size={18} />
                  )}
                  Quiz Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Score: <strong>{score}%</strong>
                </p>
                {typeof result?.correctCount === "number" &&
                  typeof result?.total === "number" && (
                    <p>
                      Correct answers:{" "}
                      <strong>
                        {result.correctCount} / {result.total}
                      </strong>
                    </p>
                  )}
              </CardContent>
            </Card>
          )}

          {/* ACTIONS */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              {!submitted ? (
                <Button onClick={handleNext} disabled={submitting}>
                  {currentIndex === totalQuestions - 1 ? (
                    submitting ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )
                  ) : (
                    "Next"
                  )}
                </Button>
              ) : (
                <Button onClick={() => navigate(-1)}>Done</Button>
              )}
            </div>
          </div>
        </>
      )}
      {/* Celebration Popup */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm animate-bounce-in">
            <div className="text-6xl mb-4 animate-pulse">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">
              Congratulations!
            </h2>
            <p className="text-muted-foreground mb-4">
              You've successfully completed your lesson quiz.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
