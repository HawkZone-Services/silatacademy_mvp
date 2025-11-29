import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import programService from "@/services/programService";
import { useToast } from "@/hooks/use-toast";

interface EditProgramDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  program: any;
  onUpdated?: () => void;
}

export function EditProgramDialog({
  open,
  setOpen,
  program,
  onUpdated,
}: EditProgramDialogProps) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    targetAudience: "",
    classSchedule: "",
  });

  // Load program data when modal opens
  useEffect(() => {
    if (program) {
      setForm({
        title: program.title || "",
        description: program.description || "",
        duration: program.duration || "",
        targetAudience: program.targetAudience || "",
        classSchedule: program.classSchedule || "",
      });
    }
  }, [program]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    // Validation
    if (!form.title.trim()) {
      return toast({
        title: "Missing Title",
        description: "Program title is required.",
        variant: "destructive",
      });
    }

    const res = await programService.updateProgram(program._id, form);

    if (!res.success) {
      toast({
        title: "Update Failed",
        description: res.message || "Unable to update program.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Updated Successfully",
      description: "Program has been updated.",
    });

    setOpen(false);
    onUpdated && onUpdated();
  };

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="space-y-4 max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            name="title"
            value={form.title}
            placeholder="Program Title"
            onChange={handleChange}
          />

          <Textarea
            name="description"
            value={form.description}
            rows={4}
            placeholder="Program Description"
            onChange={handleChange}
          />

          <Input
            name="duration"
            value={form.duration}
            placeholder="Duration (e.g., 3-6 months)"
            onChange={handleChange}
          />

          <Input
            name="targetAudience"
            value={form.targetAudience}
            placeholder="Target Audience"
            onChange={handleChange}
          />

          <Input
            name="classSchedule"
            value={form.classSchedule}
            placeholder="Class Schedule"
            onChange={handleChange}
          />
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
