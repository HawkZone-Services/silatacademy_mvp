// src/features/student/dashboard/components/AttendanceTab.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { AttendanceSummary } from "../types";

interface Props {
  attendance: AttendanceSummary | null;
  attendanceRecords: any[];
}

export default function AttendanceTab({
  attendance,
  attendanceRecords,
}: Props) {
  return (
    <TabsContent value="attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
          <CardDescription>
            Your session attendance, trends, and daily logs.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SUMMARY */}
          {attendance ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg bg-accent/10">
                  <p className="text-xs text-muted-foreground">
                    Total Sessions
                  </p>
                  <p className="text-xl font-semibold">
                    {attendance.totalSessions}
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-accent/10">
                  <p className="text-xs text-muted-foreground">Attended</p>
                  <p className="text-xl font-semibold">
                    {attendance.attendedSessions}
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-accent/10">
                  <p className="text-xs text-muted-foreground">Absent</p>
                  <p className="text-xl font-semibold">
                    {attendance.absentSessions}
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-accent/10">
                  <p className="text-xs text-muted-foreground">Last Session</p>
                  <p className="text-sm font-medium">
                    {attendance.lastSessionDate
                      ? new Date(
                          attendance.lastSessionDate
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Attendance Rate
                </p>
                <Progress value={attendance.attendanceRate} />
              </div>
            </>
          ) : (
            <p>No attendance summary yet.</p>
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
                              : "text-red-600 border-red-600"
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">{log.coachName || "—"}</td>
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
