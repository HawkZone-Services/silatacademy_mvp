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
  const status = moduleData.status;
  const isArchived = status === "archived";
  const isActive = status === "active";

  const [form, setForm] = useState({
    title: moduleData.title,
    topics: (moduleData.topics || []).join("\n"),
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await moduleService.updateModule(moduleData._id, {
        title: form.title,
        topics: form.topics
          .split("\n")
          .map((t: string) => t.trim())
          .filter(Boolean),
      });

      onUpdated && onUpdated();
      setOpen(false);
    } catch (err) {
      console.error("Update module failed:", err);
      alert("Failed to update module");
    }
  };

  // 🔒 Archived → Read only
  if (isArchived) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archived Module</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This module is archived and cannot be edited.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
        </DialogHeader>

        {/* TITLE */}
        <Input
          name="title"
          value={form.title}
          onChange={handleChange}
          disabled={isActive}
        />

        {/* TOPICS */}
        <Textarea
          name="topics"
          rows={5}
          value={form.topics}
          onChange={handleChange}
          disabled={isActive}
        />

        {isActive && (
          <p className="text-sm text-muted-foreground text-center">
            Active modules cannot be edited. Archive the module to make changes.
          </p>
        )}

        <Button className="w-full" onClick={handleSubmit} disabled={isActive}>
          Update Module
        </Button>
      </DialogContent>
    </Dialog>
  );
}
