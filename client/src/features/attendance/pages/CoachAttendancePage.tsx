import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import attendanceService from "@/features/attendance/api/attendanceService";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export default function CoachAttendancePage() {
  const [playerId, setPlayerId] = useState("");

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["coach-attendance", playerId],
    queryFn: () => attendanceService.getPlayerAttendance(playerId),
    enabled: false, // manual trigger
  });

  const logs = data?.data?.attendance || data?.attendance || data?.data || [];

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">Player Attendance Lookup</h1>

      <div className="flex gap-2 max-w-xl">
        <Input
          placeholder="Player ID"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
        />

        <Button disabled={!playerId || isFetching} onClick={() => refetch()}>
          {isFetching ? "Loading..." : "Fetch"}
        </Button>
      </div>

      {!logs.length ? (
        <p className="text-sm text-muted-foreground">No records.</p>
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
