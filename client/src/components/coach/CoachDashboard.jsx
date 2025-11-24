import Approvals from "./Approvals";
import PlayerProgress from "./PlayerProgress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function CoachDashboard() {
  const { toast } = useToast();
  const [playerId, setPlayerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const assignTask = async () => {
    if (!playerId || !title) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/coach/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId, title, description, dueDate }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Task failed");
      toast({ title: "Training task assigned" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message || "Could not assign task",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Approve Belt Upgrades</h2>
        <Approvals />
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Player Progress</h2>
        <PlayerProgress />
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Assign Training Task</h2>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
          <Input
            placeholder="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={assignTask} disabled={saving || !playerId || !title}>
          {saving ? "Assigning..." : "Assign Task"}
        </Button>
      </Card>
    </div>
  );
}
