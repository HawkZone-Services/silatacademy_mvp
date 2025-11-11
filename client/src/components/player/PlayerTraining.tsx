import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import type { Player } from "@/data/players";

interface PlayerTrainingProps {
  player: Player;
}

export const PlayerTraining = ({ player }: PlayerTrainingProps) => {
  const { trainingLogs } = player;
  const attendanceRate =
    trainingLogs.length > 0
      ? Math.round(
          (trainingLogs.filter((log) => log.attendance).length /
            trainingLogs.length) *
            100
        )
      : 0;

  return (
    <Card className="gradient-card shadow-card border-border/40 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            Training Follow-up
          </h2>
          <Badge
            variant="outline"
            className="border-secondary/40 text-secondary"
          >
            {attendanceRate}% Attendance
          </Badge>
        </div>

        {/* Training Logs */}
        <div className="space-y-4">
          {trainingLogs.slice(0, 5).map((log, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-accent/30 border border-border/40 hover:bg-accent/50 transition-smooth"
            >
              {/* Log Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-semibold">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{log.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.attendance ? (
                    <Badge className="bg-green-500/10 border-green-500/20 text-green-500 border">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Present
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 border-red-500/20 text-red-500 border">
                      <XCircle className="h-3 w-3 mr-1" />
                      Absent
                    </Badge>
                  )}
                </div>
              </div>

              {/* Performance Notes */}
              <div className="space-y-2 pl-8">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Performance Notes:
                  </p>
                  <p className="text-sm">{log.performanceNotes}</p>
                </div>

                {/* Coach Remarks */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                  <MessageSquare className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-secondary font-semibold mb-1">
                      Coach's Remarks:
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      "{log.coachRemarks}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {trainingLogs.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No training logs recorded yet
              </p>
            </div>
          )}

          {trainingLogs.length > 5 && (
            <button className="w-full py-3 px-4 rounded-lg bg-accent/30 border border-border/40 hover:bg-accent/50 transition-smooth text-center font-semibold">
              View All {trainingLogs.length} Training Sessions
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
