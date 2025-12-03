import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { AddPlayerDialog } from "../AddPlayerDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import adminService from "@/services/adminService";
import { EditPlayerDialog } from "../EditPlayerDialog";

const PlayersScreen = ({ fetchDashboardData, token }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [editPlayerOpen, setEditPlayerOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<any | null>(null);

  const navigate = useNavigate();

  const fetchPlayers = async () => {
    try {
      const res = await adminService.getPlayers();

      const list = Array.isArray(res?.data) ? res.data : [];
      console.log("Fetched Players:", list);
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

  const filteredPlayers = players.filter((player: any) => {
    const q = searchQuery.toLowerCase();
    return (
      player.name?.toLowerCase().includes(q) ||
      player.email?.toLowerCase().includes(q) ||
      player.national_id?.toLowerCase().includes(q)
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
          placeholder="Search by name, email, or ID..."
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
                <h4 className="font-semibold">{player.user.name}</h4>
                <p className="text-sm">{player.email}</p>

                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {player.beltLevel || "white"}
                  </Badge>
                  <Badge variant="secondary">{player.status || "active"}</Badge>
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
