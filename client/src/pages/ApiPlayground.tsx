import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import authService from "@/services/authService";
import adminService from "@/services/adminService";
import playerService from "@/services/playerService";
import coachService from "@/services/coachService";
import examService from "@/services/examService";
import lessonService from "@/services/lessonService";
import programService from "@/services/programService";
import rankingService from "@/services/rankingService";
import libraryService from "@/services/libraryService";
import eventService from "@/services/eventService";
import notificationService from "@/services/notificationService";
import certificateService from "@/services/certificateService";
import attendanceService from "@/services/attendanceService";
import curriculumService from "@/services/curriculumService";
import { API_BASE_URL } from "@/lib/apiClient";

type Action = {
  label: string;
  run: () => Promise<Response>;
};

const useActions = (): Record<string, Action[]> => {
  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null");

  const defaultEmail = user?.email || "admin@example.com";
  const defaultPassword = "Pass12345!";
  const playerId = user?._id || "";

  return useMemo(
    () => ({
      auth: [
        {
          label: "Login (email/password)",
          run: () =>
            authService.login({
              username: defaultEmail,
              password: defaultPassword,
            }),
        },
      ],
      admin: [
        { label: "Dashboard", run: () => adminService.getDashboard() },
        { label: "Players", run: () => adminService.getPlayers() },
        { label: "Lessons", run: () => adminService.getLessons() },
        { label: "Reports Export", run: () => adminService.getReportsExport() },
      ],
      player: [
        { label: "List Players", run: () => playerService.list() },
        playerId
          ? {
              label: "Player Attendance",
              run: () => playerService.getAttendance(playerId),
            }
          : {
              label: "Player Attendance (sample)",
              run: () => playerService.getAttendance("missing-id"),
            },
      ],
      coach: [
        { label: "Pending Upgrades", run: () => coachService.getPendingUpgrades() },
        { label: "List Coaches", run: () => coachService.listCoaches() },
      ],
      exams: [
        { label: "All Exams (admin)", run: () => examService.getAllExams() },
        { label: "Available Exams (white)", run: () => examService.getAvailableExams("white") },
        { label: "My Attempts", run: () => examService.getMyAttempts() },
      ],
      lessons: [
        { label: "List Lessons", run: () => lessonService.getLessons() },
      ],
      programs: [
        { label: "List Programs", run: () => programService.getPrograms() },
      ],
      library: [
        { label: "List Library Items", run: () => libraryService.list() },
      ],
      events: [
        { label: "List Events", run: () => eventService.list() },
      ],
      notifications: [
        { label: "My Notifications", run: () => notificationService.getAll() },
      ],
      ranking: [
        { label: "Ranking List", run: () => rankingService.getRanking() },
      ],
      curriculum: [
        { label: "Curriculum PDF (white)", run: () => curriculumService.getPdf("white") },
      ],
      certificates: [
        { label: "My Certificates", run: () => certificateService.getMyCertificates() },
      ],
      attendance: [
        { label: "Attendance Stats", run: () => attendanceService.getStats() },
      ],
    }),
    [defaultEmail, defaultPassword, playerId]
  );
};

const ApiPlayground = () => {
  const actions = useActions();
  const groups = Object.keys(actions);
  const [group, setGroup] = useState(groups[0] || "auth");
  const [result, setResult] = useState<string>("Ready.");
  const [loading, setLoading] = useState(false);

  const runAction = async (action: Action) => {
    setLoading(true);
    setResult("Running...");
    try {
      const res = await action.run();
      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
      setResult(
        JSON.stringify(
          { status: res.status, ok: res.ok, body: parsed },
          null,
          2
        )
      );
    } catch (err: any) {
      setResult(`Error: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const activeActions = actions[group] || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Playground</CardTitle>
            <p className="text-sm text-muted-foreground">
              Base URL: {API_BASE_URL}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Choose a group then trigger any action below.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  onClick={() => runAction(action)}
                  disabled={loading}
                >
                  {loading ? "Running..." : action.label}
                </Button>
              ))}
              {activeActions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No actions for this group.
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Response</p>
              <Textarea
                value={result}
                readOnly
                className="font-mono text-xs min-h-[240px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiPlayground;
