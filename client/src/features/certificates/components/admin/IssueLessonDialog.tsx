import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";

import adminService from "@/features/gates/admin/api/adminService";
import certificateService from "@/features/certificates/api/certificateService";

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

  /* ======================================================
      LOAD LESSONS + PLAYERS ON OPEN
  ====================================================== */
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        // Axios responses
        const lessonsRes = await adminService.getLessons();
        const playersRes = await adminService.getPlayers();

        // Normalize lessons (could be many formats)
        const lessonsList =
          lessonsRes?.data?.lessons ||
          lessonsRes?.data?.data?.lessons ||
          lessonsRes?.data ||
          [];

        setLessons(Array.isArray(lessonsList) ? lessonsList : []);

        // Normalize players (Player + nested user)
        const playersList =
          playersRes?.data?.players ||
          playersRes?.data?.data?.players ||
          playersRes?.data ||
          [];

        setStudents(Array.isArray(playersList) ? playersList : []);
      } catch (err) {
        console.error("IssueLessonDialog load error:", err);
      }
    };

    load();
  }, [open]);

  /* ======================================================
      ISSUE LESSON CERTIFICATE
  ====================================================== */
  const handleIssue = async () => {
    if (!lessonId || !studentId) return;

    try {
      setLoading(true);

      const res = await certificateService.issueLesson(lessonId, studentId);

      if (!res?.data?.success) {
        console.error("IssueLesson error:", res.data);
      }

      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueLesson error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ====================================================== */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Lesson Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* SELECT LESSON */}
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

          {/* SELECT STUDENT */}
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s._id} value={s.user?._id || s._id}>
                  {s.user?.name || s.name} — {s.user?.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ISSUE BUTTON */}
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
