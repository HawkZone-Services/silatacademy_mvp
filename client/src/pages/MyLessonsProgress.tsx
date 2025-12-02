import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Lock,
  CheckCircle2,
  Clock,
  ListChecks,
  Target,
  ArrowRight,
} from "lucide-react";

import { getStudentLessons } from "@/features/lessons/api/getStudentLessons";

/** نوع الدرس بعد التطبيع */
type LessonProgressItem = {
  _id: string;
  title: string;
  programTitle?: string;
  moduleTitle?: string;
  beltLevel?: string;
  order?: number;

  // progress
  completed?: boolean;
  locked?: boolean;

  // quiz
  quizAvailable?: boolean;
  quizCompleted?: boolean;
  quizScore?: number | null;

  // attendance gating
  requiredAttendance?: number | null;
  myAttendance?: number | null;

  // meta
  date?: string | null;
};

export default function MyLessonsProgress() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonProgressItem[]>([]);
  const [filter, setFilter] = useState<
    "all" | "available" | "locked" | "completed"
  >("all");

  // ===============================
  // Normalize backend payload
  // ===============================
  const normalizeLesson = (raw: any): LessonProgressItem => {
    if (!raw) return {} as LessonProgressItem;

    const base = raw.lesson || raw; // بعض APIs بترجع { lesson, progress }

    return {
      _id: String(base._id || raw._id || ""),
      title: base.title || base.name || "Untitled Lesson",
      programTitle:
        base.program?.title || raw.programTitle || raw.program_name || "",
      moduleTitle: base.module?.title || raw.moduleTitle || "",
      beltLevel: base.beltLevel || raw.beltLevel || base.level || "",
      order: base.order || base.sortIndex || raw.order || 0,

      completed:
        typeof raw.completed === "boolean"
          ? raw.completed
          : !!raw.progress?.completed,

      locked:
        typeof raw.locked === "boolean" ? raw.locked : !!raw.progress?.locked,

      quizAvailable:
        typeof raw.quizAvailable === "boolean"
          ? raw.quizAvailable
          : !!base.quizAvailable || !!base.hasQuiz,

      quizCompleted:
        typeof raw.quizCompleted === "boolean"
          ? raw.quizCompleted
          : !!raw.progress?.quizCompleted,

      quizScore:
        raw.quizScore ??
        raw.progress?.quizScore ??
        (typeof raw.score === "number" ? raw.score : null),

      requiredAttendance:
        raw.requiredAttendance ??
        raw.progress?.requiredAttendance ??
        base.requiredAttendance ??
        null,

      myAttendance:
        raw.myAttendance ??
        raw.progress?.myAttendance ??
        (typeof raw.attendance === "number" ? raw.attendance : null),

      date: base.date || base.scheduledAt || null,
    };
  };

  // ===============================
  // Fetch lessons from backend
  // ===============================
  const loadLessons = async () => {
    setLoading(true);

    try {
      // ممكن يكون الـ service بيرجع Response أو JSON جاهز
      const res: any = await getStudentLessons();

      const data = res?.data || res || {};

      const rawList =
        data.lessons ||
        data.items ||
        data.data ||
        (Array.isArray(data) ? data : []);

      const normalized = (rawList || []).map(normalizeLesson);

      // sort by belt → module → order
      normalized.sort((a, b) => {
        const beltA = (a.beltLevel || "").localeCompare(b.beltLevel || "");
        if (beltA !== 0) return beltA;

        const progA = (a.programTitle || "").localeCompare(
          b.programTitle || ""
        );
        if (progA !== 0) return progA;

        return (a.order || 0) - (b.order || 0);
      });

      setLessons(normalized);
    } catch (err) {
      console.error("MyLessonsProgress fetch error:", err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  // ===============================
  // Derived Progress Stats
  // ===============================
  const total = lessons.length;
  const completedCount = lessons.filter((l) => l.completed).length;
  const lockedCount = lessons.filter((l) => l.locked).length;
  const pendingCount = total - completedCount;
  const completionPercent = total
    ? Math.round((completedCount / total) * 100)
    : 0;

  const nextLessons = lessons
    .filter((l) => !l.completed && !l.locked)
    .slice(0, 3);

  // ===============================
  // Handlers
  // ===============================
  const handleStartOrViewLesson = (lesson: LessonProgressItem) => {
    // روح لصفحة الدرس التفصيلية
    navigate(`/student/lessons/${lesson._id}`);
  };

  const handleStartQuiz = (lesson: LessonProgressItem) => {
    // كويز الدرس (منفصل عن اختبار الحزام)
    navigate(`/student/lessons/${lesson._id}/quiz`);
  };

  // ===============================
  // Render
  // ===============================
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-lg">
        Loading your lessons...
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-secondary" />
            My Lessons Progress
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your lesson completion, quizzes, and attendance impact on belt
            exams.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/student/lessons")}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            View All Lessons
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/student/attendance")}
            className="flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4" />
            View Attendance
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARD */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-secondary" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="outline">
              Total Lessons: <span className="ml-1 font-semibold">{total}</span>
            </Badge>
            <Badge variant="outline">
              Completed:
              <span className="ml-1 font-semibold">{completedCount}</span>
            </Badge>
            <Badge variant="outline">
              Available:
              <span className="ml-1 font-semibold">{availableCount}</span>
            </Badge>
            <Badge variant="outline">
              Locked:
              <span className="ml-1 font-semibold">{lockedCount}</span>
            </Badge>
          </div>

          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">
              Completion Rate
            </p>
            <div className="w-full bg-accent/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-secondary"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs mt-1">
              {completionPercent}% of your lessons are completed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("available")}
        >
          Available
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "locked" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("locked")}
        >
          Locked
        </Button>
      </div>

      {/* LESSONS LIST */}
      <div className="space-y-4">
        {filteredLessons.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No lessons found for this filter.
          </p>
        )}

        {filteredLessons.map((lesson) => {
          const label = lesson.completed
            ? "Completed"
            : lesson.locked
            ? "Locked"
            : "Available";

          const labelColor = lesson.completed
            ? "bg-green-600"
            : lesson.locked
            ? "bg-gray-600"
            : "bg-blue-600";

          const quizLabel = lesson.quizAvailable
            ? lesson.quizCompleted
              ? `Quiz Completed${
                  typeof lesson.quizScore === "number"
                    ? ` (${lesson.quizScore}%)`
                    : ""
                }`
              : "Quiz Available"
            : "No quiz";

          const attendanceText =
            typeof lesson.requiredAttendance === "number"
              ? `Attendance: ${lesson.myAttendance || 0}/${
                  lesson.requiredAttendance
                }`
              : null;

          return (
            <Card
              key={lesson._id}
              className="border-border/40 hover:shadow-sm transition"
            >
              <CardContent className="py-4 space-y-3">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-base flex items-center gap-2">
                      {lesson.title}
                      {lesson.beltLevel && (
                        <Badge
                          variant="outline"
                          className="capitalize text-xs border-secondary/50"
                        >
                          {lesson.beltLevel} belt
                        </Badge>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lesson.programTitle && (
                        <>
                          Program: <strong>{lesson.programTitle}</strong>
                        </>
                      )}
                      {lesson.moduleTitle && (
                        <>
                          {" "}
                          • Module: <strong>{lesson.moduleTitle}</strong>
                        </>
                      )}
                      {lesson.date && (
                        <>
                          {" "}
                          • <Clock className="inline h-3 w-3 mr-0.5 mb-0.5" />
                          {new Date(lesson.date).toLocaleString()}
                        </>
                      )}
                    </p>
                    {attendanceText && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {attendanceText}
                      </p>
                    )}
                  </div>

                  <Badge className={`${labelColor} text-white`}>{label}</Badge>
                </div>

                {/* QUIZ + ACTIONS */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {quizLabel}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={lesson.locked}
                      onClick={() => handleStartOrViewLesson(lesson)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      {lesson.completed ? "Review Lesson" : "Start Lesson"}
                    </Button>

                    {lesson.quizAvailable && (
                      <Button
                        size="sm"
                        variant={lesson.quizCompleted ? "outline" : "default"}
                        disabled={lesson.locked}
                        onClick={() => handleStartQuiz(lesson)}
                      >
                        <ListChecks className="h-4 w-4 mr-1" />
                        {lesson.quizCompleted ? "View Quiz" : "Take Quiz"}
                      </Button>
                    )}

                    {lesson.locked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <Lock className="h-3 w-3" />
                        Complete required lessons / attendance first
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* LINK TO BELT EXAMS */}
      <div className="flex justify-end pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/student/exams")}
          className="flex items-center gap-1 text-xs"
        >
          Go to Belt Exams
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
