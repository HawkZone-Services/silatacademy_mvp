// src/features/student/dashboard/components/OverviewHeader.tsx

import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AttendanceSummary,
  StudentInfo,
  beltColorClass,
  beltLabel,
} from "../types";

interface Props {
  student: StudentInfo | null;
  attendance: AttendanceSummary | null;
}

export default function OverviewHeader({ student, attendance }: Props) {
  const attendanceRate = attendance?.attendanceRate ?? 0;

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
          Welcome back,
          <span className="text-secondary">{student?.name || "Student"}</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your training, attendance, lessons, and exams in one place.
        </p>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-2">
        <Badge
          className={`px-4 py-2 text-sm font-semibold ${beltColorClass(
            student?.beltLevel
          )}`}
        >
          {beltLabel(student?.beltLevel)}
        </Badge>

        {attendance && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance: {attendanceRate.toFixed(0)}%
          </div>
        )}
      </div>
    </section>
  );
}
