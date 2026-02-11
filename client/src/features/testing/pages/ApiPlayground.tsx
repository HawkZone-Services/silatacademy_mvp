import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import authService from "@/features/auth/api/authService";
import adminService from "@/features/gates/admin/api/adminService";
import playerService from "@/features/players/api/playerService";
import coachService from "@/features/coaches/api/coachService";
import examService from "@/features/testing/api/examService";
import lessonService from "@/features/lessons/api/lessonService";
import programService from "@/features/programs/api/programService";
import rankingService from "@/features/belt-ranking/api/rankingService";
import libraryService from "@/features/articles/api/libraryService";
import eventService from "@/features/support/api/eventService";
import notificationService from "@/features/support/api/notificationService";
import certificateService from "@/features/certificates/api/certificateService";
import attendanceService from "@/features/attendance/api/attendanceService";
import curriculumService from "@/features/lessons/api/curriculumService";
import { API_BASE_URL } from "@/shared/api";

type Action = {
  label: string;
  run: () => Promise<any>;
};

const useActions = (): Record<string, Action[]> => {
  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null");

  const defaultEmail = user?.nationalId || "29310210103471";
  const defaultAdminEmail = user?.nationalId || "29310210103471";
  const defaultCoachEmail = user?.nationalId || "29310210103472";
  const defaultStudentEmail = user?.nationalId || "29310210103473";
  const defaultPassword = "123456789";
  const playerId = user?._id || "";

  return useMemo(
    () => ({
      auth: [
        {
          label: "Login (admin)",
          run: () =>
            authService.login({
              username: defaultAdminEmail,
              password: defaultPassword,
            }),
        },
        {
          label: "Login (Coach)",
          run: () =>
            authService.login({
              username: defaultCoachEmail,
              password: defaultPassword,
            }),
        },
        {
          label: "Login (Student)",
          run: () =>
            authService.login({
              username: defaultStudentEmail,
              password: defaultPassword,
            }),
        },
      ],

      admin: [
        { label: "Dashboard", run: () => adminService.getDashboard() },
        { label: "Players", run: () => adminService.getPlayers() },
        { label: "Lessons", run: () => adminService.getLessons() },
        { label: "Attendance", run: () => adminService.getAttendanceToday() },
        { label: "Reports Export", run: () => adminService.getReportsExport() },
      ],
      player: [
        { label: "Me", run: () => playerService.getMe() },
        { label: "My Full Profile", run: () => playerService.getFullProfile() },
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
        {
          label: "Pending Upgrades",
          run: () => coachService.getPendingUpgrades(),
        },
        { label: "List Coaches", run: () => coachService.listCoaches() },
      ],
      exams: [
        { label: "All Exams (admin)", run: () => examService.getAllExams() },
        {
          label: "Available Exams (white)",
          run: () => examService.getAvailableExams("white"),
        },
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
      events: [{ label: "List Events", run: () => eventService.list() }],
      notifications: [
        { label: "My Notifications", run: () => notificationService.getAll() },
      ],
      ranking: [
        { label: "Ranking List", run: () => rankingService.getRanking() },
      ],
      curriculum: [
        {
          label: "Curriculum PDF (white)",
          run: () => curriculumService.getPdf("white"),
        },
      ],
      certificates: [
        {
          label: "My Certificates",
          run: () => certificateService.getMyCertificates(),
        },
      ],
      attendance: [
        { label: "Attendance Stats", run: () => attendanceService.getStats() },
      ],
    }),
    [defaultEmail, defaultPassword, playerId],
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
      setResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResult(`Error: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const activeActions = actions[group] || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className=" mx-auto space-y-4">
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
                className="font-mono text-xs min-h-[500px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiPlayground;
