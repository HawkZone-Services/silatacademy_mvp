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
import examService from "@/services/examService";
import certificateService from "@/services/certificateService";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onIssued: () => void;
};

export default function IssueExamOverrideDialog({
  open,
  setOpen,
  onIssued,
}: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const playersRes = await adminService.getPlayers();
        const examsRes = await examService.getAllExams();

        const playersJson = (await playersRes.json()) || [];
        const examsJson = (await examsRes.json()) || {};

        setStudents(playersJson);
        setExams(examsJson.exams || examsJson || []);
      } catch (err) {
        console.error("IssueExamOverrideDialog load error:", err);
      }
    };

    load();
  }, [open]);

  const handleIssue = async () => {
    if (!examId || !studentId) return;

    try {
      setLoading(true);
      const res = await certificateService.issueExamOverride(examId, studentId);
      if (!res.ok) console.error("IssueExamOverride error:", res);
      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueExamOverride error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override Exam Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e: any) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.title}
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
            variant="destructive"
            onClick={handleIssue}
            disabled={!examId || !studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Override Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
