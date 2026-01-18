import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import programService from "@/services/programService";
import moduleService from "@/services/moduleService";
import beltRankingService from "@/features/belt-ranking/api/beltRankingService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function AddModuleDialog({ onModuleAdded }) {
  const [open, setOpen] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [beltLevels, setBeltLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    program: "",
    moduleType: "A",
    beltLevel: "", // ✅ slug only (white, yellow, ...)
    title: "",
    objectives: "",
    anatomyFocus: "",
    repetitionGoal: "",
    commonMistakes: "",
  });

  /* =============================
     LOAD PROGRAMS
  ============================== */
  useEffect(() => {
    const loadPrograms = async () => {
      const res = await programService.getPrograms();
      if (res?.success) setPrograms(res.programs || []);
    };
    loadPrograms();
  }, []);

  /* =============================
     LOAD BELT LEVELS
  ============================== */
  useEffect(() => {
    const loadBeltLevels = async () => {
      try {
        setLoading(true);

        const res: any = await beltRankingService.list();

        const list = res?.data || []; // ✅ لأن backend بيرجع Array

        setBeltLevels(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load belt levels", err);
        setBeltLevels([]);
      } finally {
        setLoading(false);
      }
    };

    loadBeltLevels();
  }, []);

  console.log("Belt Levels:", beltLevels);
  console.log("form:", form);
  /* =============================
     HELPERS
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toArray = (v) =>
    v
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  /* =============================
     SUBMIT
  ============================== */
  const handleSubmit = async () => {
    if (!form.program || !form.title || !form.beltLevel) {
      alert("Program, title and belt level are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        program: form.program,
        moduleType: form.moduleType,
        beltLevel: form.beltLevel, // ✅ slug
        order: Number(form.order) || 0,

        title: form.title,
        objectives: toArray(form.objectives),
        anatomyFocus: toArray(form.anatomyFocus),
        repetitionGoal: form.repetitionGoal || undefined,
        commonMistakes: toArray(form.commonMistakes),
      };

      await moduleService.createModule(payload);

      alert(
        "Module created as Draft.\nActivate it to make it visible to students."
      );

      setOpen(false);
      setForm({
        program: "",
        moduleType: "A",
        beltLevel: "",
        order: 0,
        title: "",
        objectives: "",
        anatomyFocus: "",
        repetitionGoal: "",
        commonMistakes: "",
      });

      onModuleAdded && onModuleAdded();
    } catch (err) {
      console.error("Create module failed:", err);
      alert("Failed to create module");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     RENDER
  ============================== */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Module</Button>
      </DialogTrigger>

      <DialogContent className="space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Module (Draft)</DialogTitle>
        </DialogHeader>

        {/* Program */}
        <Select
          value={form.program}
          onValueChange={(value) => setForm((f) => ({ ...f, program: value }))}
        >
          <SelectTrigger className="bg-transparent border backdrop-blur-md">
            <SelectValue placeholder="Select Program" />
          </SelectTrigger>

          <SelectContent className="bg-black/40 backdrop-blur-lg text-white">
            {programs.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Module Type */}
        <Select
          value={form.moduleType}
          onValueChange={(v) => setForm((f) => ({ ...f, moduleType: v }))}
        >
          <SelectTrigger className="bg-transparent border">
            <SelectValue placeholder="Select Module Type" />
          </SelectTrigger>

          <SelectContent className="bg-transparent backdrop-blur-md">
            <SelectItem value="A">A — Anatomy / Science</SelectItem>
            <SelectItem value="B">B — Behavior / Ethics</SelectItem>
            <SelectItem value="P">P — Physical Practice</SelectItem>
            <SelectItem value="E">E — Evaluation</SelectItem>
          </SelectContent>
        </Select>

        {/* Belt Level (CORRECT CONCEPT) */}
        <Select
          value={form.beltLevel}
          onValueChange={(value) =>
            setForm((f) => ({ ...f, beltLevel: value }))
          }
        >
          <SelectTrigger className="bg-transparent border w-full">
            <SelectValue placeholder="Select Belt Level" />
          </SelectTrigger>

          <SelectContent className="bg-transparent backdrop-blur-md">
            {beltLevels.map((belt) => (
              <SelectItem key={belt._id} value={belt._id}>
                {belt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Title */}
        <Input
          name="title"
          placeholder="Module Title"
          value={form.title}
          onChange={handleChange}
        />

        {/* Objectives */}
        <Textarea
          name="objectives"
          rows={4}
          placeholder="Objectives (one per line)"
          value={form.objectives}
          onChange={handleChange}
        />

        {/* Anatomy Focus */}
        <Textarea
          name="anatomyFocus"
          rows={3}
          placeholder="Anatomy Focus (one per line)"
          value={form.anatomyFocus}
          onChange={handleChange}
        />

        {/* Repetition Goal */}
        <Input
          name="repetitionGoal"
          placeholder="Repetition Goal"
          value={form.repetitionGoal}
          onChange={handleChange}
        />

        {/* Common Mistakes */}
        <Textarea
          name="commonMistakes"
          rows={3}
          placeholder="Common Mistakes (one per line)"
          value={form.commonMistakes}
          onChange={handleChange}
        />

        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Module (Draft)"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
