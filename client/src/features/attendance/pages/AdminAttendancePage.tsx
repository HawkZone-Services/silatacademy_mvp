import { useQuery } from "@tanstack/react-query";
import attendanceService from "@/features/attendance/api/attendanceService";

export default function AdminAttendancePage() {
  const { data: statsData } = useQuery(["attendance-stats"], () =>
    attendanceService.getStats()
  );
  const stats = statsData?.data?.stats || statsData?.stats || statsData?.data || [];

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">Attendance Overview</h1>
      <div className="grid gap-3">
        {stats.map((s: any) => (
          <div key={s._id} className="p-4 border rounded-lg bg-accent/10">
            <div className="font-semibold capitalize">{s._id}</div>
            <div className="text-sm text-muted-foreground">{s.count} sessions</div>
          </div>
        ))}
      </div>
    </div>
  );
}
