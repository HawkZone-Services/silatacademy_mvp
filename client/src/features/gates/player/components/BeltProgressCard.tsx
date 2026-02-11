import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { getProgressColor } from "@/shared/utils/getProgressColor";
export default function BeltProgressCard({ data }: { data: any }) {
  if (!data || !data.belt) return null;

  const { belt, attendance, lessons } = data;
  const attended = attendance?.attendedSessions ?? 0;
  const required = attendance?.requiredSessions ?? 0;
  const minRate = attendance?.minRate ?? 0;
  const attendanceRate = attendance.attendanceRate ?? 0;
  const lessonsRate =
    lessons.required > 0
      ? Math.round((lessons.completed / lessons.required) * 100)
      : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{belt.name}</span>
          <Badge variant="outline">{belt.level}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Attendance */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Attendance</span>
            <span>
              {attended} / {required}
            </span>
          </div>

          <div className="relative h-2 rounded-full overflow-hidden bg-muted">
            {/* Background */}
            <div className="absolute inset-0 bg-muted" />

            {/* Colored progress (real percentage) */}
            <div
              className="absolute top-0 left-0 h-full transition-all"
              style={{
                width: `${attendanceRate}%`,
                backgroundColor: getProgressColor(attendanceRate),
              }}
            />
          </div>

          <Badge
            variant={attendanceRate >= minRate ? "default" : "destructive"}
            className="mt-2"
          >
            {attendanceRate}% (min {minRate}%)
          </Badge>
        </div>
        {/* Lessons */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Lessons</span>
            <span>
              {lessons.completed} / {lessons.required}
            </span>
          </div>

          <div className="relative h-2 rounded-full overflow-hidden bg-muted">
            {/* Background */}
            <div className="absolute inset-0 bg-muted" />

            {/* Colored progress (real percentage) */}
            <div
              className="absolute top-0 left-0 h-full transition-all"
              style={{
                width: `${lessonsRate}%`,
                backgroundColor: getProgressColor(lessonsRate),
              }}
            />
          </div>

          <p className="text-xs mt-1 text-muted-foreground">
            {lessons.completed}% completed
          </p>
        </div>

        {/* Requirements */}
        {Array.isArray(belt.requirements) && belt.requirements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Requirements</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {belt.requirements.map((req: string, i: number) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
