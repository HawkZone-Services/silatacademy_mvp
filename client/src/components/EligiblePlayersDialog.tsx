import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { players } from "@/data/players";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface EligiblePlayersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock eligibility data
const eligibilityData = players.map((player, index) => ({
  ...player,
  status:
    index % 3 === 0 ? "Eligible" : index % 3 === 1 ? "Pending" : "Not Eligible",
  lastTestDate: index % 2 === 0 ? "2024-09-15" : "2024-06-20",
  coachNotes:
    index % 2 === 0
      ? "Excellent progress. Ready for advancement."
      : "Needs more practice in Jurus 5-6.",
}));

export const EligiblePlayersDialog = ({
  open,
  onOpenChange,
}: EligiblePlayersDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [beltFilter, setBeltFilter] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const filteredPlayers = eligibilityData.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesBelt = beltFilter === "all" || player.belt === beltFilter;

    return matchesSearch && matchesStatus && matchesBelt;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Eligible":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Not Eligible":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const uniqueBelts = Array.from(new Set(players.map((p) => p.belt)));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] bg-background border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Eligible Players for Testing
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>

              <Select value={beltFilter} onValueChange={setBeltFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Filter by belt" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">All Belts</SelectItem>
                  {uniqueBelts.map((belt) => (
                    <SelectItem key={belt} value={belt}>
                      {belt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Eligible">Eligible</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Not Eligible">Not Eligible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredPlayers.length} of {eligibilityData.length}{" "}
              players
            </p>

            {/* Players Table */}
            <div className="overflow-y-auto max-h-[400px] space-y-2">
              {filteredPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="p-4 cursor-pointer hover:bg-accent/20 transition-smooth border-border/40"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {player.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Belt Level
                        </p>
                        <p className="text-sm font-medium">{player.belt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="text-sm font-medium">
                          {player.age} years
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge className={getStatusColor(player.status)}>
                          {player.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredPlayers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No players found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Details Side Panel */}
      <Sheet
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      >
        <SheetContent className="bg-background border-border/40 overflow-y-auto">
          {selectedPlayer && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">
                  Player Details
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedPlayer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">National ID</p>
                    <p className="font-medium">{selectedPlayer.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Belt
                    </p>
                    <p className="font-medium">{selectedPlayer.belt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{selectedPlayer.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedPlayer.status)}>
                      {selectedPlayer.status}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Test Date
                    </p>
                    <p className="font-medium">{selectedPlayer.lastTestDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coach</p>
                    <p className="font-medium">{selectedPlayer.coach}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <p className="text-sm text-muted-foreground mb-2">
                    Coach Notes
                  </p>
                  <p className="text-sm bg-accent/20 p-3 rounded-lg border border-border/40">
                    {selectedPlayer.coachNotes}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
