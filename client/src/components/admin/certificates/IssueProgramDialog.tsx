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
import programService from "@/services/programService";
import certificateService from "@/services/certificateService";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onIssued: () => void;
};

export default function IssueProgramDialog({ open, setOpen, onIssued }: Props) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [programId, setProgramId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const programsRes = await programService.getPrograms();
        const playersRes = await adminService.getPlayers();

        const programsJson = programsRes.programs || programsRes || [];
        const playersJson = (await playersRes.json()) || [];

        setPrograms(programsJson);
        setStudents(playersJson);
      } catch (err) {
        console.error("IssueProgramDialog load error:", err);
      }
    };

    load();
  }, [open]);

  const handleIssue = async () => {
    if (!programId || !studentId) return;

    try {
      setLoading(true);
      const res = await certificateService.issueProgram(programId, studentId);
      if (!res.ok) console.error("IssueProgram error:", res);
      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueProgram error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Program Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p: any) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.title}
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
            disabled={!programId || !studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
