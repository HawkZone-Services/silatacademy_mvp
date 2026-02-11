// src/features/student/dashboard/components/AttendanceTab.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { TabsContent } from "@/shared/ui/tabs";
import { AttendanceSummary } from "../types";
import { getProgressColor } from "@/shared/utils/getProgressColor";

interface Props {
  attendance: AttendanceSummary | null;
  attendanceRecords: any[];
}

export default function AttendanceTab({
  attendance,
  attendanceRecords,
}: Props) {
  const requiredSessions = attendance?.requiredSessions;
  const minRate = attendance?.minRate ?? 0;
  const passed = attendance?.passed;

  return (
    <TabsContent value="attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
          <CardDescription>
            Your training attendance and progress toward belt requirements.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SUMMARY */}
          {attendance ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <SummaryItem
                  label="Total Sessions"
                  value={attendance.totalSessions}
                />
                <SummaryItem
                  label="Attended"
                  value={attendance.attendedSessions}
                />
                <SummaryItem label="Absent" value={attendance.absentSessions} />
                <SummaryItem
                  label="Last Session"
                  value={
                    attendance.lastSessionDate
                      ? new Date(
                          attendance.lastSessionDate
                        ).toLocaleDateString()
                      : "—"
                  }
                />
              </div>

              {/* RATE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {attendance.attendanceRate}%
                    </span>

                    {typeof passed === "boolean" && (
                      <Badge variant={passed ? "default" : "destructive"}>
                        {passed ? "Eligible" : "Not Eligible"}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="relative h-2 rounded-full overflow-hidden bg-muted">
                  {/* Background */}
                  <div className="absolute inset-0 bg-muted" />

                  {/* Colored progress (real percentage) */}
                  <div
                    className="absolute top-0 left-0 h-full transition-all"
                    style={{
                      width: `${attendance.attendanceRate}%`,
                      backgroundColor: getProgressColor(
                        attendance.attendanceRate
                      ),
                    }}
                  />
                </div>

                {/* Belt Requirement */}
                {requiredSessions && (
                  <p className="text-xs text-muted-foreground">
                    Required for belt:{" "}
                    <strong>
                      {attendance.attendedSessions} / {requiredSessions}
                    </strong>{" "}
                    sessions
                    {minRate > 0 && ` (min ${minRate}%)`}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No attendance summary yet.</p>
          )}

          {/* RECORDS TABLE */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-semibold text-sm">
              Attendance Records
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm">
                No attendance records found.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-accent/10">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Coach</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceRecords.map((log) => (
                    <tr key={log._id} className="border-t">
                      <td className="px-3 py-2">
                        {new Date(log.sessionDate).toLocaleDateString()}
                      </td>

                      <td className="px-3 py-2">
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            log.status === "present"
                              ? "text-green-600 border-green-600"
                              : log.status === "late"
                              ? "text-yellow-600 border-yellow-600"
                              : "text-red-600 border-red-600"
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </td>

                      <td className="px-3 py-2">{log.coach?.name || "—"}</td>

                      <td className="px-3 py-2 text-muted-foreground">
                        {log.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

/* =======================
   SMALL HELPER
======================= */
function SummaryItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 border rounded-lg bg-accent/10">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
