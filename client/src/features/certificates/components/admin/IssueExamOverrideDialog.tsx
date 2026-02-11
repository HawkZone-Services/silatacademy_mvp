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
import examService from "@/features/testing/api/examService";
import certificateService from "@/features/certificates/api/certificateService";

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

  /* =======================================================
      LOAD PLAYERS + EXAMS WHEN DIALOG OPENS
  ======================================================= */
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const playersRes = await adminService.getPlayers(); // axios
        const examsRes = await examService.getAllExams(); // axios

        // Normalize players
        const players =
          playersRes?.data?.players || playersRes?.data || playersRes || [];

        setStudents(Array.isArray(players) ? players : []);

        // Normalize exams
        const examsList =
          examsRes?.data?.data?.exams ||
          examsRes?.data?.exams ||
          examsRes?.data ||
          [];

        setExams(Array.isArray(examsList) ? examsList : []);
      } catch (err) {
        console.error("IssueExamOverrideDialog load error:", err);
      }
    };

    load();
  }, [open]);

  /* =======================================================
      ISSUE OVERRIDE CERTIFICATE
  ======================================================= */
  const handleIssue = async () => {
    if (!examId || !studentId) return;

    try {
      setLoading(true);

      const res = await certificateService.issueExamOverride(examId, studentId);

      if (!res?.data?.success) {
        console.error("IssueExamOverride error:", res);
      }

      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueExamOverride error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================= */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override Exam Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Select Exam */}
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

          {/* Select Student */}
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s._id} value={s.user?._id || s._id}>
                  {s.name || s.user?.name || s.fullName || s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Issue Button */}
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
