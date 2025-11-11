import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, Award } from "lucide-react";
import type { Player } from "@/data/players";

interface PlayerHeaderProps {
  player: Player;
}

export const PlayerHeader = ({ player }: PlayerHeaderProps) => {
  return (
    <Card className="gradient-card shadow-card border-border/40 overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Photo */}
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl bg-accent flex items-center justify-center border-4 border-secondary/20">
              <User className="h-16 w-16 text-secondary" />
            </div>
            <Badge
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-bold px-4"
              style={{
                backgroundColor: player.beltColor,
                color: player.beltColor === "#1a1a1a" ? "#fff" : "#000",
              }}
            >
              {player.belt}
            </Badge>
          </div>

          {/* Player Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                {player.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                Athlete ID: {player.id.padStart(4, "0")}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/40">
                <Calendar className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Training Since
                  </p>
                  <p className="font-semibold">
                    {new Date(player.trainingStartDate).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short" }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/40">
                <Award className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Coach</p>
                  <p className="font-semibold">{player.coach}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/40">
                <User className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Age / Height / Weight
                  </p>
                  <p className="font-semibold">
                    {player.age}y / {player.height} / {player.weight}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/40">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-sm truncate">
                    {player.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/40">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold">{player.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/40">
                <Calendar className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-semibold">{player.trainingYears} Years</p>
                </div>
              </div>
            </div>

            {/* Current Focus */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">
                Current Training Focus
              </p>
              <p className="font-semibold text-foreground">
                {player.currentFocus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
