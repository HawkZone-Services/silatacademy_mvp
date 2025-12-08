// src/features/student/dashboard/components/StatsCards.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, ClipboardList, TrendingUp } from "lucide-react";

import {
  AttendanceSummary,
  CertificateItem,
  ExamItem,
  LessonItem,
} from "../types";

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
  const attendanceRate = attendance?.attendanceRate ?? 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {attendanceRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={attendanceRate} className="mt-3" />
        </CardContent>
      </Card>

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
