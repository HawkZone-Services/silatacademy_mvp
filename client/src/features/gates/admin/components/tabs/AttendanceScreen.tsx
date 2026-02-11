import { useEffect, useMemo, useState } from "react";

import { TabsContent } from "@/shared/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/utils/utils";

import attendanceService from "@/features/attendance/api/attendanceService";
import playerService from "@/features/players/api/playerService";

type AttendanceStatus = "present" | "absent" | "late";

type PlayerRow = {
  _id: string;
  name: string;
  beltLevel?: string;
};

type AttendanceRow = {
  playerId: string;
  name: string;
  beltLevel?: string;
  status: AttendanceStatus;
  notes: string;
};

function toISODateOnly(d: Date) {
  // YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function statusBadge(status: AttendanceStatus) {
  switch (status) {
    case "present":
      return <Badge className="bg-green-600 text-white">Present</Badge>;
    case "absent":
      return <Badge className="bg-red-600 text-white">Absent</Badge>;
    case "late":
      return <Badge className="bg-amber-600 text-white">Late</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function AttendanceScreen() {
  const { toast } = useToast();

  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [saving, setSaving] = useState(false);

  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);

  const [sessionDate, setSessionDate] = useState<string>(() =>
    toISODateOnly(new Date())
  );
  const [sessionId, setSessionId] = useState<string>(""); // optional
  const [search, setSearch] = useState<string>("");

  // =========================
  // Load Players
  // =========================
  const loadPlayers = async () => {
    try {
      setLoadingPlayers(true);

      const res: any = await playerService.getAllPlayers();

      // مرن جدًا مع اختلاف ال responses
      const raw =
        res?.data?.players ||
        res?.data?.data?.players ||
        res?.data?.users ||
        res?.data?.data ||
        res?.data ||
        res?.players ||
        res ||
        [];

      const list: PlayerRow[] = (Array.isArray(raw) ? raw : []).map(
        (p: any) => ({
          _id: String(p._id || p.id),
          name: p?.user?.name || p.fullName || p.username || "Unknown",
          beltLevel: p.beltLevel || p.level || p.belt || "",
        })
      );

      setPlayers(list);

      // Initialize attendance rows (default present)
      setRows(
        list.map((p) => ({
          playerId: p._id,
          name: p.name,
          beltLevel: p.beltLevel,
          status: "present",
          notes: "",
        }))
      );
    } catch (err) {
      console.error("loadPlayers error:", err);
      toast({
        title: "Error",
        description: "Failed to load players list",
        variant: "destructive",
      });
      setPlayers([]);
      setRows([]);
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Derived / Filtering
  // =========================
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, search]);

  const counts = useMemo(() => {
    const present = rows.filter((r) => r.status === "present").length;
    const absent = rows.filter((r) => r.status === "absent").length;
    const late = rows.filter((r) => r.status === "late").length;
    return { present, absent, late, total: rows.length };
  }, [rows]);

  // =========================
  // Handlers
  // =========================
  const updateRow = (playerId: string, patch: Partial<AttendanceRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, ...patch } : r))
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const submit = async () => {
    if (!rows.length) return;

    try {
      setSaving(true);

      const payloadDate = new Date(sessionDate);

      // 🚀 Save in parallel
      await Promise.all(
        rows.map((r) =>
          attendanceService.addAttendance({
            player: r.playerId,
            status: r.status,
            notes: r.notes?.trim() ? r.notes.trim() : undefined,
            sessionDate: payloadDate,
            sessionId: sessionId?.trim() ? sessionId.trim() : undefined,
          })
        )
      );

      toast({
        title: "Saved",
        description: `Attendance saved for ${toISODateOnly(payloadDate)}.`,
      });
    } catch (err: any) {
      console.error("submit attendance error:", err);
      toast({
        title: "Error",
        description:
          err?.message ||
          err?.error?.message ||
          "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TabsContent value="attendance" className="space-y-4">
      <Card className="border-border/40">
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>
                Mark attendance for a training day (present / absent / late).
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => markAll("present")}
                disabled={saving || loadingPlayers}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                onClick={() => markAll("absent")}
                disabled={saving || loadingPlayers}
              >
                Mark All Absent
              </Button>
              <Button
                variant="outline"
                onClick={() => markAll("late")}
                disabled={saving || loadingPlayers}
              >
                Mark All Late
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Session Date
                </label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Session ID (optional)
                </label>
                <Input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="e.g. 2025-12-12-AM"
                  disabled={saving}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Search Player
                </label>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a name..."
                  disabled={loadingPlayers}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline">
                Total:{" "}
                <span className="ml-1 font-semibold">{counts.total}</span>
              </Badge>
              <Badge
                variant="outline"
                className="border-green-600 text-green-700"
              >
                Present:{" "}
                <span className="ml-1 font-semibold">{counts.present}</span>
              </Badge>
              <Badge variant="outline" className="border-red-600 text-red-700">
                Absent:{" "}
                <span className="ml-1 font-semibold">{counts.absent}</span>
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-600 text-amber-700"
              >
                Late: <span className="ml-1 font-semibold">{counts.late}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loadingPlayers ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Loading players...
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No players found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-border/40 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-accent/10">
                  <tr>
                    <th className="text-left px-3 py-2 w-[40%]">Player</th>
                    <th className="text-left px-3 py-2 w-[20%]">Status</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.playerId} className="border-t">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{r.name}</div>
                          {r.beltLevel ? (
                            <Badge
                              variant="outline"
                              className="capitalize text-xs"
                            >
                              {r.beltLevel}
                            </Badge>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Select
                            value={r.status}
                            onValueChange={(v) =>
                              updateRow(r.playerId, {
                                status: v as AttendanceStatus,
                              })
                            }
                            disabled={saving}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className={cn("hidden sm:block")}>
                            {statusBadge(r.status)}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <Input
                          value={r.notes}
                          onChange={(e) =>
                            updateRow(r.playerId, { notes: e.target.value })
                          }
                          placeholder="Optional notes..."
                          disabled={saving}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={saving || loadingPlayers || rows.length === 0}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
