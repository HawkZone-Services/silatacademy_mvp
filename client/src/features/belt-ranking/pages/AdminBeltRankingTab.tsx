// src/features/belt-ranking/pages/AdminBeltRankingTab.tsx

import { useEffect, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import beltRankingService from "../api/beltRankingService";
import { BeltRanking } from "../types/beltRanking.types";
import BeltRankingTable from "../components/BeltRankingTable";
import BeltRankingForm from "../components/BeltRankingForm";

export default function AdminBeltRankingTab() {
  const [belts, setBelts] = useState<BeltRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BeltRanking | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const res: any = await beltRankingService.list();
    setBelts(res?.data || []);
    setLoading(false);
  };

  const handleSubmit = async (data: Partial<BeltRanking>) => {
    if (editing) {
      await beltRankingService.update(editing._id, data);
    } else {
      await beltRankingService.create(data);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this belt ranking?")) return;
    await beltRankingService.remove(id);
    load();
  };

  const handleEdit = (belt: BeltRanking) => {
    setEditing(belt);
    setShowForm(true);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <TabsContent value="belt-ranking" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Belt Rankings</h2>

        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Belt
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : showForm ? (
        <BeltRankingForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <BeltRankingTable
          data={belts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </TabsContent>
  );
}
