import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type AdminExamFormProps = {
  initial?: any;
  onSubmit: (payload: any) => void;
  submitting?: boolean;
};

export function AdminExamForm({ initial, onSubmit, submitting }: AdminExamFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [beltLevel, setBeltLevel] = useState(initial?.beltLevel || "");
  const [timeLimit, setTimeLimit] = useState(initial?.timeLimit || 20);
  const [description, setDescription] = useState(initial?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, beltLevel, timeLimit, description });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium">Belt Level</label>
        <Input value={beltLevel} onChange={(e) => setBeltLevel(e.target.value)} placeholder="white/yellow/..." />
      </div>
      <div>
        <label className="text-sm font-medium">Time Limit (minutes)</label>
        <Input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min={1}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save Exam"}
      </Button>
    </form>
  );
}
