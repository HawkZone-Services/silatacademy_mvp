// src/features/student/dashboard/components/StatsCards.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, ClipboardList, TrendingUp } from "lucide-react";

import {
  AttendanceSummary,
  CertificateItem,
  ExamItem,
  LessonItem,
} from "../types";
import { getProgressColor } from "@/shared/lib/getProgressColor";

interface Props {
  attendance: AttendanceSummary | null;
  lessons: LessonItem[];
  exams: ExamItem[];
  certificates: CertificateItem[];
}

export default function StatsCards({
  attendance,
  lessons,
  exams,
  certificates,
}: Props) {
  const attended = attendance?.attendedSessions ?? 0;
  const required = attendance?.requiredSessions ?? 0;
  const rate = attendance?.attendanceRate ?? 0;
  const minRate = attendance?.minRate ?? 0;
  const eligible = attendance?.eligible ?? false;

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* ATTENDANCE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Attendance Progress
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {attended} / {required} Sessions
          </div>

          {/* Progress bar (real percentage + dynamic color) */}
          <div className="relative h-2 mt-3 rounded-full overflow-hidden bg-muted">
            {/* Background */}
            <div className="absolute inset-0 bg-muted" />

            {/* Colored progress */}
            <div
              className="absolute top-0 left-0 h-full transition-all"
              style={{
                width: `${rate}%`,
                backgroundColor: getProgressColor(rate),
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {rate}% attendance • {minRate}% required
          </p>

          <p
            className={`text-xs mt-1 font-medium ${
              eligible ? "text-green-600" : "text-red-600"
            }`}
          >
            {eligible ? "Eligible for next step" : "Locked"}
          </p>
        </CardContent>
      </Card>

      {/* LESSONS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Lessons Completed
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {lessons.length ? (
            <>
              <div className="text-2xl font-bold">
                {lessons.required === 0 ? "N/A" : " "}
                {lessons.filter((l) => l.completed).length} / {lessons.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across your current belt level
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No lessons assigned yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* EXAMS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Available Exams</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">{exams.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Exams open for registration / attempts
          </p>
        </CardContent>
      </Card>

      {/* CERTIFICATES */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Certificates</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">{certificates.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Completed programs, exams, and milestones
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
