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

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const modulesRes = await moduleService.getModules();
        const playersRes = await adminService.getPlayers();

        const modulesJson = modulesRes.modules || modulesRes || [];
        const playersJson = (await playersRes.json()) || [];

        setModules(modulesJson);
        setStudents(playersJson);
      } catch (err) {
        console.error("IssueModuleDialog load error:", err);
      }
    };

    load();
  }, [open]);

  const handleIssue = async () => {
    if (!moduleId || !studentId) return;

    try {
      setLoading(true);
      const res = await certificateService.issueModule(moduleId, studentId);
      if (!res.ok) console.error("IssueModule error:", res);
      onIssued();
      setOpen(false);
    } catch (err) {
      console.error("IssueModule error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Module Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
            disabled={!moduleId || !studentId || loading}
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
