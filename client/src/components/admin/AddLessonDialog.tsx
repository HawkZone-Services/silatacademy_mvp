import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import lessonService from "@/services/lessonService";

interface AddLessonDialogProps {
  onLessonAdded?: () => void;
}

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export const AddLessonDialog = ({ onLessonAdded }: AddLessonDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    videoUrl: "",
    content: "",
    programId: "",
    moduleId: "",
    durationMinutes: "",
    resources: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const payload = {
        title: formData.title,
        summary: formData.summary,
        videoUrl: formData.videoUrl,
        content: formData.content,
        programId: formData.programId || undefined,
        moduleId: formData.moduleId || undefined,
        durationMinutes: formData.durationMinutes
          ? Number(formData.durationMinutes)
          : undefined,
        resources: formData.resources
          ? formData.resources.split("\n").filter(Boolean)
          : [],
        quiz: [],
      };

      const res = await lessonService.createLesson(payload);

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to add lesson");
      }

      toast({
        title: "Success",
        description: "Lesson added successfully",
      });

      setOpen(false);
      setFormData({
        title: "",
        summary: "",
        videoUrl: "",
        content: "",
        programId: "",
        moduleId: "",
        durationMinutes: "",
        resources: "",
      });
      onLessonAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add lesson",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Calendar className="w-4 h-4" />
          Add New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="programId">Program Id</Label>
              <Input
                id="programId"
                value={formData.programId}
                onChange={(e) =>
                  setFormData({ ...formData, programId: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="moduleId">Module Id</Label>
              <Input
                id="moduleId"
                value={formData.moduleId}
                onChange={(e) =>
                  setFormData({ ...formData, moduleId: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="resources">Resources (one per line)</Label>
            <Textarea
              id="resources"
              value={formData.resources}
              onChange={(e) =>
                setFormData({ ...formData, resources: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
