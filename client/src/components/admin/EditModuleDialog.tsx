import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import moduleService from "@/services/moduleService";

export function EditModuleDialog({
  moduleData,
  open,
  setOpen,
  onUpdated,
}: any) {
  const [form, setForm] = useState({
    title: moduleData.title,
    topics: moduleData.topics.join("\n"),
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await moduleService.updateModule(moduleData._id, {
      title: form.title,
      topics: form.topics.split("\n").map((t: string) => t.trim()),
    });

    onUpdated();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
        </DialogHeader>

        <Input name="title" defaultValue={form.title} onChange={handleChange} />

        <Textarea
          name="topics"
          defaultValue={form.topics}
          rows={5}
          onChange={handleChange}
        />

        <Button className="w-full" onClick={handleSubmit}>
          Update Module
        </Button>
      </DialogContent>
    </Dialog>
  );
}
