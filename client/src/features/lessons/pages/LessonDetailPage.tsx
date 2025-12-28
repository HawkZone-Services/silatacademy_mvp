// --- Enhanced LessonDetailPage with Silat Academy colors preserved ---
// --- Stable Hooks Order — No Conditional Returns Before Hooks -----

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Loader2,
  ListChecks,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  FileText,
  ExternalLink,
  Sparkles,
  Brain,
  Heart,
  Wrench,
  GraduationCap,
} from "lucide-react";

import { getLessonById } from "../api/getLessonById";
import { saveProgress } from "../api/saveProgress";
import { completeLesson } from "../api/completeLesson";

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  /* --------------------- Fetch lesson --------------------- */
  const fetchLesson = async () => {
    try {
      const res = await getLessonById(lessonId);
      const data = res?.data?.lesson || res?.lesson || res?.data || res;
      setLesson(data);
      console.log("Lesson detail:", lesson);
    } catch {
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };
  console.log("Lesson state:", lesson);

  useEffect(() => {
    if (lessonId) {
      saveProgress(lessonId, { positionSeconds: 0 }).catch(() => {});
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const handleCompleteLesson = async () => {
    if (!lessonId) return;
    try {
      setCompleting(true);
      await completeLesson(lessonId);
      await fetchLesson();
    } finally {
      setCompleting(false);
    }
  };

  /* --------------------- Enhanced Sections Layout --------------------- */
  const contentSections = useMemo(
    () =>
      [
        {
          key: "summary",
          title: "Summary",
          text: lesson?.summary,
          icon: Sparkles,
        },
        {
          key: "general",
          title: "General Content",
          text: lesson?.content,
          icon: BookOpen,
        },
        {
          key: "technical",
          title: "Technical Content",
          text: lesson?.technicalContent,
          icon: Wrench,
        },
        {
          key: "medical",
          title: "Medical Content",
          text: lesson?.medicalContent,
          icon: Heart,
        },
        {
          key: "psychology",
          title: "Psychology Content",
          text: lesson?.psychologyContent,
          icon: Brain,
        },
      ].filter((sec) => sec.text),
    [lesson]
  );

  /* --------------------- Detect Active Section on Scroll --------------------- */
  useEffect(() => {
    if (!contentSections.length) return;

    const handleScroll = () => {
      let current = null;
      contentSections.forEach((section) => {
        const element = document.getElementById(`section-${section.key}`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 160 && rect.bottom >= 160) {
          current = section.key;
        }
      });

      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentSections]);

  /* ====================================================================================
      RENDER — Only JSX conditionals, no early returns
  ==================================================================================== */
  const completed = lesson?.progress?.completed;
  const quizScore = lesson?.progress?.quizScore;
  const hasQuiz = lesson?.quiz?.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* ----------------------------------------------------------------------
          LOADING STATE
      ----------------------------------------------------------------------- */}
      {loading && (
        <div className="container max-w-4xl py-12 space-y-8 animate-pulse">
          <div className="h-10 w-48 rounded bg-muted"></div>
          <div className="aspect-video w-full rounded bg-muted"></div>
          <div className="h-4 w-3/4 rounded bg-muted"></div>
          <div className="h-4 w-1/2 rounded bg-muted"></div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          ERROR STATE
      ----------------------------------------------------------------------- */}
      {!loading && !lesson && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-red-500">
            Failed to load lesson
          </h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </Button>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          MAIN CONTENT
      ----------------------------------------------------------------------- */}
      {!loading && lesson && (
        <>
          {/* HERO SECTION */}
          <div className="border-b bg-muted/20">
            <div className="container max-w-6xl py-8 space-y-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                {lesson.program?.title && (
                  <>
                    <span>/</span>
                    <span>{lesson.program.title}</span>
                  </>
                )}

                {lesson.module?.title && (
                  <>
                    <span>/</span>
                    <span>{lesson.module.title}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl font-bold">{lesson.title}</h1>

              {lesson.summary && (
                <p className="text-muted-foreground max-w-2xl">
                  {lesson.summary}
                </p>
              )}

              {/* Status Badges */}
              <div className="flex gap-2">
                {typeof quizScore === "number" && (
                  <Badge
                    variant="outline"
                    className="border-primary text-primary"
                  >
                    Score: {quizScore}%
                  </Badge>
                )}

                {completed && (
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-600 flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Completed
                  </Badge>
                )}
              </div>

              {/* Video */}
              {lesson.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-black shadow-lg border">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-[400px]"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          {contentSections.length > 1 && (
            <div className="container max-w-6xl py-6 flex flex-wrap gap-2">
              {contentSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => {
                      setActiveSection(sec.key);
                      document
                        .getElementById(`section-${sec.key}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Icon size={16} /> {sec.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* SIDEBAR NAV — Sticky */}
          <div className="hidden lg:block fixed top-24 left-6 w-56">
            <div className="space-y-2 p-4 border rounded-xl bg-card shadow-sm">
              <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">
                Navigation
              </p>

              {contentSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => {
                      setActiveSection(section.key);
                      document
                        .getElementById(`section-${section.key}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon size={16} />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENT SECTIONS */}
          <div className="container max-w-6xl space-y-6 pb-10">
            {contentSections.map((sec) => {
              const Icon = sec.icon;
              return (
                <Card
                  key={sec.key}
                  id={`section-${sec.key}`}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-primary" />
                      </span>
                      {sec.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {sec.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {/* RESOURCES */}
            {lesson.resources?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Additional
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {lesson.resources.map((r: string, idx: number) => (
                    <a
                      key={idx}
                      href={r}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="text-primary" />
                        </div>
                        <span className="truncate">{r}</span>
                      </div>
                      <ExternalLink
                        size={16}
                        className="text-muted-foreground"
                      />
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-between pt-8 border-t">
              {/* ALWAYS SHOW BACK BUTTON */}
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft size={16} /> Back
              </Button>

              {/* ===============================
   NO QUIZ → MANUAL COMPLETE
================================ */}
              {!hasQuiz && !lesson.progress?.completed && (
                <Button onClick={handleCompleteLesson} disabled={completing}>
                  {completing ? (
                    <Loader2 className="mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2" />
                  )}
                  Mark as Completed
                </Button>
              )}

              {/* ===============================
   HAS QUIZ → START QUIZ
================================ */}
              {hasQuiz && !lesson.progress?.completed && (
                <Button
                  onClick={() => navigate(`/student/lessons/${lessonId}/quiz`)}
                  className="flex items-center gap-2"
                >
                  <ListChecks size={16} />
                  Start Quiz
                </Button>
              )}

              {/* ===============================
   COMPLETED STATE (UX FEEDBACK)
================================ */}
              {lesson.progress?.completed && (
                <Button
                  variant="outline"
                  disabled
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Lesson Completed
                </Button>
              )}

              {/* IF COMPLETED → NO QUIZ BUTTON */}
            </div>

            {/* COMPLETION BOX */}
            {completed && (
              <div className="mt-8 p-6 rounded-xl bg-green-50 border flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Lesson Completed!</h3>
                  <p className="text-muted-foreground text-sm">
                    Great job! You've successfully completed this lesson.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
