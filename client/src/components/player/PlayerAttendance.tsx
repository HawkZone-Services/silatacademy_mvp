import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp } from "lucide-react";
import {
  AttendanceRecord,
  generateMockAttendance,
  calculateAttendanceRate,
} from "@/data/attendance";

interface PlayerAttendanceProps {
  playerId: string;
}

export const PlayerAttendance = ({ playerId }: PlayerAttendanceProps) => {
  const attendanceRecords = generateMockAttendance(playerId);
  const attendanceRate = calculateAttendanceRate(attendanceRecords);

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    const variants = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      excused: "outline",
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Card className="gradient-card shadow-card border-border/40 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center border border-secondary/20">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">
                Attendance History
              </h3>
              <p className="text-sm text-muted-foreground">Last 15 sessions</p>
            </div>
          </div>
        </div>

        {/* Attendance Rate Widget */}
        <div className="p-4 rounded-lg bg-accent/30 border border-secondary/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span className="font-semibold">Attendance Rate</span>
            </div>
            <span className="text-2xl font-display font-bold text-secondary">
              {attendanceRate}%
            </span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {attendanceRecords.filter((r) => r.status === "present").length}{" "}
            present •
            {attendanceRecords.filter((r) => r.status === "late").length} late •
            {attendanceRecords.filter((r) => r.status === "absent").length}{" "}
            absent
          </p>
        </div>

        {/* Attendance Table */}
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/20">
                  <TableHead>Date</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Coach</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.slice(0, 10).map((record) => (
                  <TableRow key={record.id} className="hover:bg-accent/10">
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{record.lesson}</TableCell>
                    <TableCell>{record.coach}</TableCell>
                    <TableCell>{record.duration}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {attendanceRecords.length > 10 && (
          <p className="text-sm text-center text-muted-foreground">
            Showing 10 of {attendanceRecords.length} records
          </p>
        )}
      </div>
    </Card>
  );
};
