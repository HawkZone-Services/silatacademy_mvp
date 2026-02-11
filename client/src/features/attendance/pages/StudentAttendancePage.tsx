import { useQuery } from "@tanstack/react-query";
import attendanceService from "@/features/attendance/api/attendanceService";

export default function StudentAttendancePage() {
  const { data, isLoading } = useQuery(["my-attendance"], () =>
    attendanceService.getMyAttendance()
  );
  const logs = data?.data?.attendance || data?.attendance || data?.data || [];

  if (isLoading) return <div className="p-6">Loading attendance...</div>;

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">My Attendance</h1>
      {!logs.length ? (
        <p className="text-sm text-muted-foreground">No attendance records.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-accent/20">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Coach</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log._id} className="border-t">
                  <td className="px-3 py-2">
                    {log.sessionDate
                      ? new Date(log.sessionDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 capitalize">{log.status}</td>
                  <td className="px-3 py-2">{log.coachName || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {log.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
