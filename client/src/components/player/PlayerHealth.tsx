import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Activity,
  Utensils,
  Moon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { Player } from "@/data/players";

interface PlayerHealthProps {
  player: Player;
}

const statusConfig = {
  excellent: {
    color: "bg-green-500/10 border-green-500/20 text-green-500",
    label: "Excellent",
    icon: CheckCircle,
  },
  good: {
    color: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    label: "Good",
    icon: CheckCircle,
  },
  fair: {
    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    label: "Fair",
    icon: AlertCircle,
  },
  "attention-needed": {
    color: "bg-red-500/10 border-red-500/20 text-red-500",
    label: "Needs Attention",
    icon: AlertCircle,
  },
};

export const PlayerHealth = ({ player }: PlayerHealthProps) => {
  const { health } = player;
  const statusInfo = statusConfig[health.status];

  return (
    <Card className="gradient-card shadow-card border-border/40 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Health & Wellness</h2>
          <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.color} border`}>
              <statusInfo.icon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Last Checkup */}
          <div className="p-4 rounded-lg bg-accent/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-secondary">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">Last Medical Checkup</span>
            </div>
            <p className="text-lg font-bold">
              {new Date(health.lastCheckup).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Injuries */}
          <div className="p-4 rounded-lg bg-accent/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-secondary">
              <Activity className="h-5 w-5" />
              <span className="font-semibold">Injury Status</span>
            </div>
            {health.injuries.length > 0 ? (
              <ul className="space-y-1">
                {health.injuries.map((injury, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-yellow-500 mt-1">•</span>
                    {injury}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-500 font-semibold">
                No current injuries ✓
              </p>
            )}
          </div>

          {/* Nutrition Plan */}
          <div className="p-4 rounded-lg bg-accent/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-secondary">
              <Utensils className="h-5 w-5" />
              <span className="font-semibold">Nutrition Plan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {health.nutritionPlan}
            </p>
          </div>

          {/* Rest Schedule */}
          <div className="p-4 rounded-lg bg-accent/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-secondary">
              <Moon className="h-5 w-5" />
              <span className="font-semibold">Rest & Recovery</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {health.restSchedule}
            </p>
          </div>
        </div>

        {/* Medical Notes */}
        {health.medicalNotes && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold text-secondary mb-2">
              Medical Notes
            </p>
            <p className="text-sm text-muted-foreground">
              {health.medicalNotes}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
