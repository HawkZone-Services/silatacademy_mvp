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

  /* =====================================================
      LOAD DATA
  ====================================================== */
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        // ---- LOAD PROGRAMS ----
        const programsRes = await programService.getPrograms();
        const programsList =
          programsRes?.data?.programs ||
          programsRes?.data ||
          programsRes?.programs ||
          [];

        setPrograms(Array.isArray(programsList) ? programsList : []);

        // ---- LOAD STUDENTS ----
        const playersRes = await adminService.getPlayers();
        const playersList =
          playersRes?.data?.players ||
          playersRes?.data?.data?.players ||
          playersRes?.data ||
          [];

        setStudents(Array.isArray(playersList) ? playersList : []);
      } catch (err) {
        console.error("IssueProgramDialog load error:", err);
      }
    };

    loadData();
  }, [open]);

  /* =====================================================
      ISSUE CERTIFICATE
  ====================================================== */
  const handleIssue = async () => {
    if (!programId || !studentId) return;
    setLoading(true);

    try {
      const res = await certificateService.issueProgram(programId, studentId);

      if (!res?.data?.success) {
        console.error("IssueProgram error:", res?.data);
      }

      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueProgram error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================== */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Program Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* SELECT PROGRAM */}
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

          {/* SELECT STUDENT */}
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => {
                const uid = s.user?._id || s._id;
                const display =
                  s.user?.name ||
                  s.name ||
                  s.user?.email ||
                  s.email ||
                  "Unnamed student";

                return (
                  <SelectItem key={uid} value={uid}>
                    {display}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* BUTTON */}
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
