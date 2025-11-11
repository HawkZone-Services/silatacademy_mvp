import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap, Wind, Activity, Target } from "lucide-react";
import type { Player } from "@/data/players";

interface PlayerStatsProps {
  player: Player;
}

export const PlayerStats = ({ player }: PlayerStatsProps) => {
  const { stats } = player;
  const avgScore = Math.round(
    (stats.power + stats.flexibility + stats.endurance + stats.speed) / 4
  );

  const statConfig = [
    {
      key: "power",
      label: "Power",
      icon: Zap,
      value: stats.power,
      color: "text-red-500",
    },
    {
      key: "flexibility",
      label: "Flexibility",
      icon: Wind,
      value: stats.flexibility,
      color: "text-blue-500",
    },
    {
      key: "endurance",
      label: "Endurance",
      icon: Activity,
      value: stats.endurance,
      color: "text-green-500",
    },
    {
      key: "speed",
      label: "Speed",
      icon: Target,
      value: stats.speed,
      color: "text-yellow-500",
    },
  ];

  return (
    <Card className="gradient-card shadow-card border-border/40 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            Athletic Performance
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
              <p className="font-display text-xl font-bold text-secondary">
                {avgScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {statConfig.map((stat) => (
            <div key={stat.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="font-semibold">{stat.label}</span>
                </div>
                <span className="font-display text-lg font-bold text-secondary">
                  {stat.value}%
                </span>
              </div>
              <Progress value={stat.value} className="h-3" />
            </div>
          ))}
        </div>

        {/* Performance Radar Chart Placeholder */}
        <div className="pt-4 border-t border-border/40">
          <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg border border-border/40">
            <div className="text-center space-y-2">
              <Activity className="h-12 w-12 text-secondary mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Performance visualization chart
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
