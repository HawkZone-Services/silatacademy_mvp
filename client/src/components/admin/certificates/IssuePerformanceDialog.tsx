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

export default function IssuePerformanceDialog({
  open,
  setOpen,
  onIssued,
}: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================================================
      LOAD STUDENTS
  ====================================================== */
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const playersRes = await adminService.getPlayers();

        const playersList =
          playersRes?.data?.players ||
          playersRes?.data?.data?.players ||
          playersRes?.data ||
          [];

        setStudents(Array.isArray(playersList) ? playersList : []);
      } catch (err) {
        console.error("IssuePerformanceDialog load error:", err);
      }
    };

    load();
  }, [open]);

  /* =====================================================
      ISSUE PERFORMANCE CERTIFICATE
  ====================================================== */
  const handleIssue = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      const res = await certificateService.issuePerformance(studentId);

      if (!res?.data?.success) {
        console.error("IssuePerformance error:", res?.data);
      }

      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssuePerformance error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================== */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Performance Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
            disabled={!studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
