import { useState, useEffect } from "react";
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
import moduleService from "@/services/moduleService";

export function AddModuleDialog({ onModuleAdded }) {
  const [open, setOpen] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({
    program: "",
    title: "",
    topics: "",
  });

  useEffect(() => {
    const load = async () => {
      const res = await programService.getPrograms();
      if (res.success) setPrograms(res.programs);
    };
    load();
  }, []);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const payload = {
      program: form.program,
      title: form.title,
      topics: form.topics
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean),
    };

    await moduleService.createModule(payload);

    setOpen(false);
    onModuleAdded && onModuleAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Module</Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
        </DialogHeader>

        {/* PROGRAM SELECTION */}
        <select
          name="program"
          className="border rounded p-2"
          onChange={handleChange}
        >
          <option value="">Select Program</option>
          {programs.map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <Input
          name="title"
          placeholder="Module Title"
          onChange={handleChange}
        />

        <Textarea
          name="topics"
          placeholder={
            "Topics (each topic on new line)\nExample:\nBasic footwork\nBalance drills\nJurus 1 practice"
          }
          rows={5}
          onChange={handleChange}
        />

        <Button className="w-full" onClick={handleSubmit}>
          Save Module
        </Button>
      </DialogContent>
    </Dialog>
  );
}
