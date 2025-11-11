import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, GraduationCap, FileText } from "lucide-react";
import type { Player } from "@/data/players";

interface PlayerAchievementsProps {
  player: Player;
}

const achievementIcons = {
  competition: Trophy,
  belt: Award,
  workshop: GraduationCap,
  certificate: FileText,
};

const achievementColors = {
  competition: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  belt: "bg-purple-500/10 border-purple-500/20 text-purple-500",
  workshop: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  certificate: "bg-green-500/10 border-green-500/20 text-green-500",
};

export const PlayerAchievements = ({ player }: PlayerAchievementsProps) => {
  return (
    <Card className="gradient-card shadow-card border-border/40 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            Achievements & Certificates
          </h2>
          <Badge
            variant="outline"
            className="border-secondary/40 text-secondary"
          >
            {player.achievements.length} Total
          </Badge>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {player.achievements.map((achievement, index) => {
            const Icon = achievementIcons[achievement.type];
            const colorClass = achievementColors[achievement.type];

            return (
              <div
                key={index}
                className="relative pl-8 pb-6 border-l-2 border-border/40 last:border-l-0 last:pb-0"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute left-0 -translate-x-1/2 h-10 w-10 rounded-full flex items-center justify-center border-2 ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display font-bold text-lg">
                      {achievement.title}
                    </h3>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(achievement.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {achievement.description}
                  </p>
                  <Badge variant="outline" className="border-border/40 text-xs">
                    {achievement.type.charAt(0).toUpperCase() +
                      achievement.type.slice(1)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {player.achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No achievements recorded yet
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
