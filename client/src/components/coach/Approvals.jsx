import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function Approvals() {
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [beltSelections, setBeltSelections] = useState({});

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/coach/belt-upgrades/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.pending)) setPending(data.pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const approve = async (id, toBelt) => {
    try {
      const res = await fetch(`${API}/coach/belt-upgrades/${id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toBelt }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Approve failed");
      toast({ title: "Upgrade approved" });
      fetchPending();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message || "Could not approve",
      });
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading approvals...</p>;
  if (!pending.length) return <p className="text-muted-foreground">No pending upgrades.</p>;

  const belts = ["white", "yellow", "blue", "brown", "red", "black"];

  return (
    <div className="space-y-3">
      {pending.map((entry) => {
        const selected = beltSelections[entry._id] || entry.toBelt || entry.fromBelt;
        return (
          <Card key={entry._id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {entry.user?.name || "Student"} ({entry.fromBelt} → {selected})
              </p>
              <p className="text-sm text-muted-foreground">
                Exam: {entry.examId?.title || "N/A"} | Current: {entry.fromBelt}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selected}
                onValueChange={(v) =>
                  setBeltSelections((prev) => ({ ...prev, [entry._id]: v }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select belt" />
                </SelectTrigger>
                <SelectContent>
                  {belts.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => approve(entry._id, selected)}>Approve</Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
