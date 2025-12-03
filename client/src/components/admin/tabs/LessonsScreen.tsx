import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { AddPlayerDialog } from "../AddPlayerDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import adminService from "@/services/adminService";

const LessonsScreen = ({
  fetchDashboardData,
  searchQuery,
  setSearchQuery,
  players,
}) => {
  const [editPlayerOpen, setEditPlayerOpen] = useState(false);

  const navigate = useNavigate();
  const filteredPlayers = players.filter((player: any) => {
    const q = searchQuery.toLowerCase();
    return (
      player.name?.toLowerCase().includes(q) ||
      player.email?.toLowerCase().includes(q) ||
      player.national_id?.toLowerCase().includes(q)
    );
  });
  const fetchOlayers = async () => {
    try {
      const res = await adminService.getPlayers();

      const list = Array.isArray(res?.modules)
        ? res.modules
        : Array.isArray(res)
        ? res
        : [];

      setModules(list);
    } catch (err) {
      console.error("Fetch Modules Error:", err);
      setModules([]);
    }
  };
  const handleEditPlayer = (player: any) => {
    editPlayerOpen(player);
    setEditPlayerOpen(true);
  };

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
                <h4 className="font-semibold">{player.name}</h4>
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
      </CardContent>
    </Card>
  );
};

export default LessonsScreen;
