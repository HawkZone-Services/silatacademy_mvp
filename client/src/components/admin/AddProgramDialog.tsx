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

export function AddProgramDialog({ onProgramAdded }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    targetAudience: "",
    classSchedule: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await programService.createProgram(form);
    setOpen(false);
    onProgramAdded && onProgramAdded();
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
          onChange={handleChange}
        />
        <Textarea
          name="description"
          placeholder="Program Description"
          onChange={handleChange}
        />
        <Input
          name="duration"
          placeholder="Duration (e.g., 3-6 months)"
          onChange={handleChange}
        />
        <Input
          name="targetAudience"
          placeholder="Target Audience"
          onChange={handleChange}
        />
        <Input
          name="classSchedule"
          placeholder="Class Schedule"
          onChange={handleChange}
        />

        <Button className="w-full" onClick={handleSubmit}>
          Save Program
        </Button>
      </DialogContent>
    </Dialog>
  );
}
