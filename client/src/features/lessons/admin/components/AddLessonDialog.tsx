// src/features/admin/lessons/components/AddLessonDialog.tsx

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { LessonForm } from "./LessonForm";
import { createLessonAdmin, CreateLessonPayload } from "../api";
import { useToast } from "@/shared/hooks/use-toast";

type AddLessonDialogProps = {
  onLessonAdded?: () => void;
};

export function AddLessonDialog({ onLessonAdded }: AddLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: CreateLessonPayload = {
        title: formValues.title,
        summary: formValues.summary,
        videoUrl: formValues.videoUrl,
        technicalContent: formValues.technicalContent,
        medicalContent: formValues.medicalContent,
        psychologyContent: formValues.psychologyContent,
        content: formValues.content,
        durationMinutes: formValues.durationMinutes,
        resources: formValues.resourcesText
          ? String(formValues.resourcesText)
              .split("\n")
              .map((r: string) => r.trim())
              .filter(Boolean)
          : [],
        moduleId: formValues.moduleId,
        programId: formValues.programId,
        order: formValues.order,
        // quiz: []  // هنسيبها فاضية حالياً، ونعمل Quiz Builder لوحده
      };

      return createLessonAdmin(payload);
    },
    onSuccess: () => {
      toast({
        title: "Lesson created",
        description: "The lesson has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      onLessonAdded?.();
      setOpen(false);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to create lesson";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formValues.title || !formValues.programId || !formValues.moduleId) {
      toast({
        title: "Missing required fields",
        description: "Title, Program ID and Module ID are required.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Lesson</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <LessonForm initial={null} onChange={setFormValues} />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Creating..." : "Create Lesson"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
