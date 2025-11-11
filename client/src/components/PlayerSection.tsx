import { PlayerCard } from "./PlayerCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { players } from "@/data/players";

export const PlayersSection = () => {
  return (
    <section id="players" className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.jpg')] bg-repeat"></div>
      </div>

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
            <span className="text-sm font-medium text-secondary">
              Our Champions
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Meet Our <span className="text-secondary">Athletes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Dedicated warriors mastering the art of Pencak Silat through
            discipline and determination
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search athletes by name..."
              className="pl-10 bg-card border-border/40 h-12"
            />
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {players.map((player) => (
            <PlayerCard key={player.name} {...player} />
          ))}
        </div>
      </div>
    </section>
  );
};
