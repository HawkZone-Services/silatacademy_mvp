// src/features/admin/lessons/components/EditLessonDialog.tsx

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
import { Lesson } from "../types";
import { updateLessonAdmin, UpdateLessonPayload } from "../api";
import { useToast } from "@/shared/hooks/use-toast";

type EditLessonDialogProps = {
  lesson: Lesson;
};

export function EditLessonDialog({ lesson }: EditLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: UpdateLessonPayload = {
        title: formValues.title ?? lesson.title,
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
          : lesson.resources || [],
        moduleId: formValues.moduleId,
        programId: formValues.programId,
        order: formValues.order,
        isActive: formValues.isActive,
      };

      return updateLessonAdmin(lesson._id, payload);
    },
    onSuccess: () => {
      toast({
        title: "Lesson updated",
        description: "The lesson has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      setOpen(false);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to update lesson";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <LessonForm initial={lesson} onChange={setFormValues} />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
