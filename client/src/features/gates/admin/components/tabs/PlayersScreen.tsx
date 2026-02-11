import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import React, { useEffect, useState } from "react";

import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";
import adminService from "@/features/gates/admin/api/adminService";

import { useToast } from "@/shared/hooks/use-toast";
import {
  AddPlayerDialog,
  EditPlayerDialog,
} from "@/features/players/components/admin";

const PlayersScreen = ({ fetchDashboardData, token }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editPlayerOpen, setEditPlayerOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<any | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPlayers = async () => {
    try {
      const res = await adminService.getPlayers();
      const list = Array.isArray(res?.data) ? res.data : [];
      setPlayers(list);
    } catch (err) {
      console.error("Fetch Players Error:", err);
      setPlayers([]);
    }
  };

  const handleEditPlayer = (player: any) => {
    setEditPlayer(player);
    setEditPlayerOpen(true);
  };

  const handleDeletePlayer = async (player: any) => {
    const userId = player?.user?._id;
    if (!userId) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${player.user?.name}?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await adminService.deletePlayer(userId);

      toast({
        title: "Player Deleted",
        description: "Player, profile and user deleted successfully.",
        variant: "destructive",
      });

      await fetchPlayers(); // refresh players list
      fetchDashboardData?.(); // update dashboard
    } catch (err: any) {
      console.error("Delete Player Error:", err);

      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete player.",
        variant: "destructive",
      });
    }
  };

  const filteredPlayers = players.filter((player: any) => {
    const q = searchQuery.toLowerCase();
    const user = player.user || {};
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.nationalId?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    fetchPlayers();
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Player Management</CardTitle>
            <CardDescription>Manage academy players</CardDescription>
          </div>
          <AddPlayerDialog onPlayerAdded={fetchDashboardData} />
        </div>
      </CardHeader>

      <CardContent>
        <Input
          placeholder="Search by name, email, or national ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredPlayers.map((player: any) => (
            <div
              key={player._id}
              className="flex items-center justify-between p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition"
            >
              <div>
                <h4 className="font-semibold">{player?.user?.name}</h4>
                <p className="text-sm">{player?.user?.email}</p>

                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {player.beltLevel || "white"}
                  </Badge>
                  <Badge variant="secondary">
                    {player.user?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/player/${player._id}?mode=cert`)}
                >
                  Generate Cert
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPlayer(player)}
                >
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/player/${player._id}?mode=view`)}
                >
                  View Details
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePlayer(player)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {editPlayer && (
          <EditPlayerDialog
            open={editPlayerOpen}
            setOpen={setEditPlayerOpen}
            player={editPlayer}
            onUpdated={fetchPlayers}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PlayersScreen;
