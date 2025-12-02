import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import adminService from "@/services/adminService";
import certificateService from "@/services/certificateService";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onIssued: () => void;
};

export default function IssueLessonDialog({ open, setOpen, onIssued }: Props) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const lessonsRes = await adminService.getLessons();
        const playersRes = await adminService.getPlayers();

        // adminService غالباً بيرجع Response خام → نحتاج json
        const lessonsJson = (await lessonsRes.json()) || {};
        const playersJson = (await playersRes.json()) || [];

        setLessons(lessonsJson.lessons || lessonsJson || []);
        setStudents(playersJson || []);
      } catch (err) {
        console.error("IssueLessonDialog load error:", err);
      }
    };

    load();
  }, [open]);

  const handleIssue = async () => {
    if (!lessonId || !studentId) return;

    try {
      setLoading(true);
      const res = await certificateService.issueLesson(lessonId, studentId);
      if (!res.ok) {
        console.error("IssueLesson error:", res);
      }
      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueLesson error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Lesson Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Select value={lessonId} onValueChange={setLessonId}>
            <SelectTrigger>
              <SelectValue placeholder="Select lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l: any) => (
                <SelectItem key={l._id} value={l._id}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name || s.fullName || s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            onClick={handleIssue}
            disabled={!lessonId || !studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
