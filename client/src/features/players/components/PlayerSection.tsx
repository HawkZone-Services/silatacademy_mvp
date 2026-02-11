import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";
import playerService from "@/features/players/api/playerService";

// FINAL NORMALIZER
const normalizePlayer = (p) => {
  const user = p.user || {};

  return {
    id: p._id,
    name: user.name || "Unknown Player",
    email: user.email || "",
    phone: user.phone || "",
    gender: user.gender || "",

    belt: p.beltLabel || p.beltLevel || "white",
    beltColor: p.beltColor || "#ffffff",

    age: p.age || null,
    height: p.height || "N/A",
    weight: p.weight || "N/A",

    coach: p.coach || "Not Assigned",
    trainingYears: p.trainingYears || 0,

    image: user.profile.avatar || null,

    achievements: Array.isArray(p.achievements) ? p.achievements : [],
  };
};

export const PlayersSection = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    setLoading(true);

    try {
      const res = await playerService.getAllPlayers();

      console.log("Players response:", res);

      // API ALWAYS returns → { success, data: { players: [] } }
      if (!res.success || !res.data || !Array.isArray(res.data.players)) {
        setPlayers([]);
        setFilteredPlayers([]);
        return;
      }

      const list = res.data.players;
      console.log("Raw players list:", list);
      const normalized = list.map(normalizePlayer);

      setPlayers(normalized);
      setFilteredPlayers(normalized);
    } catch (error) {
      console.error("Players fetch error:", error);
      setPlayers([]);
      setFilteredPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // SEARCH FILTER
  useEffect(() => {
    const filtered = players.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  if (loading) {
    return (
      <section className="py-24">
        <div className="container text-center">
          <p>Loading athletes...</p>
        </div>
      </section>
    );
  }

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

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search athletes by name..."
              className="pl-10 bg-card border-border/40 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} {...player} />
          ))}

          {filteredPlayers.length === 0 && (
            <p className="text-center text-muted-foreground col-span-3 py-10">
              No athletes match your search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
