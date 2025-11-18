import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Award, TrendingUp } from "lucide-react";

interface PlayerStats {
  power: number;
  flexibility: number;
  endurance: number;
  speed: number;
}

interface PlayerCardProps {
  id: string;
  name: string;
  belt?: string;
  beltColor?: string;
  age?: number;
  stats?: Partial<PlayerStats>;
  image?: string;
  trainingYears?: number;
}

export const PlayerCard = ({
  id,
  name,
  belt,
  beltColor,
  age,
  stats,
  trainingYears,
}: PlayerCardProps) => {
  const navigate = useNavigate();

  // 🔹 Defaults آمنة للـ stats
  const safeStats: PlayerStats = {
    power: stats?.power ?? 0,
    flexibility: stats?.flexibility ?? 0,
    endurance: stats?.endurance ?? 0,
    speed: stats?.speed ?? 0,
  };

  const avgScore = Math.round(
    (safeStats.power +
      safeStats.flexibility +
      safeStats.endurance +
      safeStats.speed) /
      4
  );

  const displayAge = typeof age === "number" ? age : "-";
  const displayYears = typeof trainingYears === "number" ? trainingYears : 0;

  const displayBelt = belt || "White Belt";
  const displayBeltColor = beltColor || "#e5e5e5";

  return (
    <Card className="gradient-card shadow-card border-border/40 overflow-hidden group hover:shadow-gold transition-smooth">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center border-2 border-secondary">
              <User className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{name}</h3>
              <p className="text-sm text-muted-foreground">
                Age {displayAge} • {displayYears} years
              </p>
            </div>
          </div>
          <Badge
            className="font-semibold"
            style={{ backgroundColor: displayBeltColor, color: "#000" }}
          >
            {displayBelt}
          </Badge>
        </div>

        {/* Stats */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Power</span>
            <span className="font-semibold text-foreground">
              {safeStats.power}%
            </span>
          </div>
          <Progress value={safeStats.power} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Flexibility</span>
            <span className="font-semibold text-foreground">
              {safeStats.flexibility}%
            </span>
          </div>
          <Progress value={safeStats.flexibility} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Endurance</span>
            <span className="font-semibold text-foreground">
              {safeStats.endurance}%
            </span>
          </div>
          <Progress value={safeStats.endurance} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Speed</span>
            <span className="font-semibold text-foreground">
              {safeStats.speed}%
            </span>
          </div>
          <Progress value={safeStats.speed} className="h-2" />
        </div>

        {/* Overall Performance */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">Overall</span>
          </div>
          <span className="font-display text-lg font-bold text-secondary">
            {avgScore}%
          </span>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => navigate(`/player/${id}`)}
          className="w-full bg-accent hover:bg-accent/80 text-accent-foreground transition-smooth"
        >
          <Award className="mr-2 h-4 w-4" />
          View Full Profile
        </Button>
      </div>
    </Card>
  );
};
