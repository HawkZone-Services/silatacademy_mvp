import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import programService from "@/services/programService";

export function AddProgramDialog({ onProgramAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    targetAudience: "",
    classSchedule: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      duration: "",
      targetAudience: "",
      classSchedule: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setLoading(true);
      await programService.createProgram(form);

      // refresh list outside
      if (onProgramAdded) onProgramAdded();

      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("AddProgram error:", err);
      alert("Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Program</Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
        </DialogHeader>

        <Input
          name="title"
          placeholder="Program Title"
          value={form.title}
          onChange={handleChange}
        />

        <Textarea
          name="description"
          placeholder="Program Description"
          value={form.description}
          onChange={handleChange}
        />

        <Input
          name="duration"
          placeholder="Duration (e.g. 3–6 months)"
          value={form.duration}
          onChange={handleChange}
        />

        <Input
          name="targetAudience"
          placeholder="Target Audience"
          value={form.targetAudience}
          onChange={handleChange}
        />

        <Input
          name="classSchedule"
          placeholder="Class Schedule"
          value={form.classSchedule}
          onChange={handleChange}
        />

        <Button className="w-full" disabled={loading} onClick={handleSubmit}>
          {loading ? "Saving..." : "Save Program"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
