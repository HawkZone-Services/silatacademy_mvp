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

export default function IssueManualDialog({ open, setOpen, onIssued }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const playersRes = await adminService.getPlayers();
        const playersJson = (await playersRes.json()) || [];
        setStudents(playersJson);
      } catch (err) {
        console.error("IssueManualDialog load error:", err);
      }
    };

    load();
  }, [open]);

  const handleIssue = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const res = await certificateService.issueManual(studentId);
      if (!res.ok) console.error("IssueManual error:", res);
      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueManual error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Manual Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
            disabled={!studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
