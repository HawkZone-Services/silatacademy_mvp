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
import moduleService from "@/services/moduleService";
import certificateService from "@/services/certificateService";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onIssued: () => void;
};

export default function IssueModuleDialog({ open, setOpen, onIssued }: Props) {
  const [modules, setModules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================================================
      LOAD MODULES + STUDENTS
  ====================================================== */
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        // --- LOAD MODULES ---
        const modRes = await moduleService.getModules();
        const modulesList =
          modRes?.data?.modules || modRes?.data || modRes || [];

        setModules(Array.isArray(modulesList) ? modulesList : []);

        // --- LOAD STUDENTS ---
        const playersRes = await adminService.getPlayers();

        const playersList =
          playersRes?.data?.players ||
          playersRes?.data?.data?.players ||
          playersRes?.data ||
          [];

        setStudents(Array.isArray(playersList) ? playersList : []);
      } catch (err) {
        console.error("IssueModuleDialog load error:", err);
      }
    };

    load();
  }, [open]);

  /* =====================================================
      ISSUE MODULE CERTIFICATE
  ====================================================== */
  const handleIssue = async () => {
    if (!moduleId || !studentId) return;

    try {
      setLoading(true);

      const res = await certificateService.issueModule(moduleId, studentId);

      if (!res?.data?.success) {
        console.error("IssueModule error:", res?.data);
      }

      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueModule error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================== */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Module Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* SELECT MODULE */}
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((m: any) => (
                <SelectItem key={m._id} value={m._id}>
                  {m.title}
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

          {/* ISSUE BUTTON */}
          <Button
            className="w-full"
            onClick={handleIssue}
            disabled={!moduleId || !studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
