import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  scheduled_date: string;
  start_time: string;
}

interface Player {
  id: string;
  full_name: string;
  current_belt: string;
}

interface AttendanceRecord {
  player_id: string;
  status: string;
}

export const AttendanceTracker = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      fetchAttendance();
    }
  }, [selectedLesson]);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("scheduled_date", { ascending: false })
      .limit(20);

    if (!error && data) {
      setLessons(data);
    }
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("status", "active")
      .order("full_name");

    if (!error && data) {
      setPlayers(data);
    }
  };

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("player_id, status")
      .eq("lesson_id", selectedLesson);

    if (!error && data) {
      const attendanceMap: Record<string, string> = {};
      data.forEach((record: AttendanceRecord) => {
        attendanceMap[record.player_id] = record.status;
      });
      setAttendance(attendanceMap);
    }
  };

  const handleStatusChange = async (playerId: string, status: string) => {
    setAttendance({ ...attendance, [playerId]: status });

    const { error } = await supabase.from("attendance").upsert(
      {
        player_id: playerId,
        lesson_id: selectedLesson,
        status: status as any,
        check_in_time:
          status === "present" || status === "late"
            ? new Date().toISOString()
            : null,
      },
      {
        onConflict: "player_id,lesson_id",
      }
    );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const saveAllAttendance = async () => {
    setLoading(true);
    try {
      const records = Object.entries(attendance).map(([playerId, status]) => ({
        player_id: playerId,
        lesson_id: selectedLesson,
        status: status as any,
        check_in_time:
          status === "present" || status === "late"
            ? new Date().toISOString()
            : null,
      }));

      const { error } = await supabase.from("attendance").upsert(records, {
        onConflict: "player_id,lesson_id",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "late":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "excused":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Lesson
          </label>
          <Select value={selectedLesson} onValueChange={setSelectedLesson}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id}>
                  {lesson.title} -{" "}
                  {new Date(lesson.scheduled_date).toLocaleDateString()} at{" "}
                  {lesson.start_time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLesson && (
          <>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-accent/10 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(attendance[player.id])}
                    <div>
                      <p className="font-medium">{player.full_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {player.current_belt.replace("_", " ")} Belt
                      </p>
                    </div>
                  </div>
                  <Select
                    value={attendance[player.id] || ""}
                    onValueChange={(value) =>
                      handleStatusChange(player.id, value)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Mark status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Button
              onClick={saveAllAttendance}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save All Attendance"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
