import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import lessonService from "@/features/lessons/api/lessonService";

export default function LessonEditor({ lesson, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: lesson?.title || "",
    summary: lesson?.summary || "",
    videoUrl: lesson?.videoUrl || "",
    content: lesson?.content || "",
    technicalContent: lesson?.technicalContent || "",
    medicalContent: lesson?.medicalContent || "",
    psychologyContent: lesson?.psychologyContent || "",
    resources: (lesson?.resources || []).join("\n"),
    durationMinutes: lesson?.durationMinutes || "",
  });

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const updateField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    if (!lesson?._id || saving) return;
    setSaving(true);
    try {
      const res = await lessonService.updateLesson(lesson._id, {
        ...form,
        resources: form.resources ? form.resources.split("\n").filter(Boolean) : [],
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : undefined,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save lesson");
      }
      toast({ title: "Lesson saved" });
      onSaved?.(data.lesson || data.updated);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err?.message || "Unable to save lesson",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Lesson</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Title"
          value={form.title}
          onChange={updateField("title")}
        />
        <Textarea
          placeholder="Summary"
          value={form.summary}
          onChange={updateField("summary")}
        />
        <Input
          placeholder="Video URL"
          value={form.videoUrl}
          onChange={updateField("videoUrl")}
        />
        <Textarea
          placeholder="Main Content"
          value={form.content}
          onChange={updateField("content")}
        />
        <Textarea
          placeholder="Technical Content"
          value={form.technicalContent}
          onChange={updateField("technicalContent")}
        />
        <Textarea
          placeholder="Medical Content"
          value={form.medicalContent}
          onChange={updateField("medicalContent")}
        />
        <Textarea
          placeholder="Psychology Content"
          value={form.psychologyContent}
          onChange={updateField("psychologyContent")}
        />
        <Textarea
          placeholder="Resources (one per line)"
          value={form.resources}
          onChange={updateField("resources")}
        />
        <Input
          type="number"
          placeholder="Duration (minutes)"
          value={form.durationMinutes}
          onChange={updateField("durationMinutes")}
        />

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Lesson"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
