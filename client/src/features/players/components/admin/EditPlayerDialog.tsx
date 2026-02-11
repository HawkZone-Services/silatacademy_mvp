import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card } from "@/shared/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import adminService from "@/features/gates/admin/api/adminService";

/* ================= TYPES (optional but helpful) ================= */

type AchievementType = "competition" | "belt" | "workshop" | "certificate";

type Achievement = {
  id: string;
  title: string;
  type: AchievementType;
  date: string; // YYYY-MM-DD
  description: string;
};

type TrainingLog = {
  id: string;
  date: string; // YYYY-MM-DD
  focus: string;
  attendance: boolean;
  performanceNotes: string;
  coachRemarks: string;
};

type FormState = {
  name: string;
  nationalId: string;
  gender: "male" | "female";
  email: string;
  phone: string;

  beltLevel: string;
  coach: string;
  trainingStartDate: string; // YYYY-MM-DD
  currentFocus: string;

  stats: {
    power: number;
    flexibility: number;
    endurance: number;
    speed: number;
  };

  health: {
    status: string;
    lastCheckup: string; // YYYY-MM-DD
    medicalNotes: string;
  };

  achievements: Achievement[];
  trainingLogs: TrainingLog[];
};

/* ================= HELPERS UI ================= */

function FieldHint({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground">{text}</p>;
}

function ReviewItem({ label, value }: { label: string; value: any }) {
  // show 0 and false too; hide only null/undefined/""
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 space-y-3">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-secondary">
        {title}
      </h4>
      {children}
    </Card>
  );
}

function StepBadge({
  index,
  label,
  active,
  completed,
  onClick,
}: {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition
        ${active ? "bg-primary text-white" : ""}
        ${completed && !active ? "bg-green-500/10 text-green-600" : ""}
        ${!active && !completed ? "bg-accent/30 text-muted-foreground" : ""}
      `}
      aria-current={active ? "step" : undefined}
    >
      {index + 1}. {label}
    </button>
  );
}

/* ================= UTILS ================= */

const safeId = () => {
  // crypto.randomUUID works in modern browsers; fallback if needed
  // @ts-ignore
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const toDateLabel = (d?: string) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
};

const STEPS = [
  "Identity",
  "Training",
  "Stats",
  "Health",
  "Achievements",
  "Training Follow-up",
  "Review",
] as const;

/* ================= COMPONENT ================= */

export function EditPlayerDialog({
  open,
  setOpen,
  player,
  onUpdated,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  player: any;
  onUpdated?: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const initialForm: FormState = useMemo(
    () => ({
      name: "",
      nationalId: "",
      gender: "male",
      email: "",
      phone: "",

      beltLevel: "",
      coach: "",
      trainingStartDate: "",
      currentFocus: "",

      stats: { power: 0, flexibility: 0, endurance: 0, speed: 0 },

      health: {
        status: "excellent",
        lastCheckup: "",
        medicalNotes: "",
      },

      achievements: [],
      trainingLogs: [],
    }),
    []
  );

  const [form, setForm] = useState<FormState>(initialForm);

  const set = (k: keyof FormState, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const setStat = (k: keyof FormState["stats"], v: number) =>
    setForm((p) => ({ ...p, stats: { ...p.stats, [k]: v } }));

  const setHealth = (k: keyof FormState["health"], v: any) =>
    setForm((p) => ({ ...p, health: { ...p.health, [k]: v } }));

  /* ================= LOAD PLAYER ================= */

  useEffect(() => {
    if (!player) return;

    setStep(0); // reset to first step when opening for a new player (nice UX)

    const normalized: FormState = {
      name: player.user?.name || "",
      nationalId: player.user?.nationalId || "",
      gender: (player.user?.gender === "female" ? "female" : "male") as any,
      email: player.user?.email || "",
      phone: player.user?.phone || "",

      beltLevel: player.beltLevel || "",
      coach: player.coach || "",
      trainingStartDate: player.trainingStartDate || "",
      currentFocus: player.currentFocus || "",

      stats: player.stats || initialForm.stats,

      health: player.health || initialForm.health,

      achievements: Array.isArray(player.achievements)
        ? player.achievements.map((a: any) => ({
            id: a.id || a._id || safeId(),
            title: a.title || "",
            type: (a.type || "certificate") as AchievementType,
            date: a.date || "",
            description: a.description || "",
          }))
        : [],

      trainingLogs: Array.isArray(player.trainingLogs)
        ? player.trainingLogs.map((l: any) => ({
            id: l.id || l._id || safeId(),
            date: l.date || "",
            focus: l.focus || "",
            attendance: l.attendance ?? true,
            performanceNotes: l.performanceNotes || "",
            coachRemarks: l.coachRemarks || "",
          }))
        : [],
    };

    setForm(normalized);
  }, [player, initialForm.health, initialForm.stats]);

  /* ================= ACHIEVEMENTS HANDLERS ================= */

  const addAchievement = () => {
    const next: Achievement = {
      id: safeId(),
      title: "",
      type: "certificate",
      date: "",
      description: "",
    };
    setForm((p) => ({ ...p, achievements: [...p.achievements, next] }));
  };

  const updateAchievement = (i: number, k: keyof Achievement, v: any) => {
    setForm((p) => {
      const arr = [...p.achievements];
      arr[i] = { ...arr[i], [k]: v };
      return { ...p, achievements: arr };
    });
  };

  const removeAchievement = (i: number) => {
    setForm((p) => ({
      ...p,
      achievements: p.achievements.filter((_, idx) => idx !== i),
    }));
  };

  /* ================= TRAINING LOGS HANDLERS ================= */

  const addTrainingLog = () => {
    const next: TrainingLog = {
      id: safeId(),
      date: "",
      focus: "",
      attendance: true,
      performanceNotes: "",
      coachRemarks: "",
    };
    setForm((p) => ({ ...p, trainingLogs: [...p.trainingLogs, next] }));
  };

  const updateTrainingLog = (i: number, k: keyof TrainingLog, v: any) => {
    setForm((p) => {
      const logs = [...p.trainingLogs];
      logs[i] = { ...logs[i], [k]: v };
      return { ...p, trainingLogs: logs };
    });
  };

  const removeTrainingLog = (i: number) => {
    setForm((p) => ({
      ...p,
      trainingLogs: p.trainingLogs.filter((_, idx) => idx !== i),
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.nationalId?.trim()) {
      toast({
        title: "National ID is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // keep the same structure you already use
      await adminService.updatePlayer(player.user._id, form);

      toast({ title: "Player updated successfully" });
      setOpen(false);
      onUpdated?.();
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP CONTENT ================= */

  const StepContent = () => {
    switch (step) {
      /* ---------- Identity ---------- */
      case 0:
        return (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Identity</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={form.gender === "male" ? "default" : "outline"}
                  onClick={() => set("gender", "male")}
                >
                  Male
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={form.gender === "female" ? "default" : "outline"}
                  onClick={() => set("gender", "female")}
                >
                  Female
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <FieldHint text="Player full legal name" />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="National ID"
                value={form.nationalId}
                onChange={(e) => set("nationalId", e.target.value)}
              />
              <FieldHint text="Required for official records" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <FieldHint text="Optional – used for login/notifications" />
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                <FieldHint text="Optional – emergency & communication" />
              </div>
            </div>
          </Card>
        );

      /* ---------- Training ---------- */
      case 1:
        return (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Training</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  placeholder="Belt Level"
                  value={form.beltLevel}
                  onChange={(e) => set("beltLevel", e.target.value)}
                />
                <FieldHint text="e.g. white, yellow, blue…" />
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Coach"
                  value={form.coach}
                  onChange={(e) => set("coach", e.target.value)}
                />
                <FieldHint text="Coach name (optional)" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  type="date"
                  value={form.trainingStartDate}
                  onChange={(e) => set("trainingStartDate", e.target.value)}
                />
                <FieldHint text="Training start date" />
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Current Focus"
                  value={form.currentFocus}
                  onChange={(e) => set("currentFocus", e.target.value)}
                />
                <FieldHint text="What the athlete is focusing on right now" />
              </div>
            </div>
          </Card>
        );

      /* ---------- Stats ---------- */
      case 2:
        return (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Performance Stats</h3>
            <FieldHint text="Scores range 0–100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["power", "flexibility", "endurance", "speed"] as const).map(
                (s) => (
                  <div className="space-y-2" key={s}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.stats[s]}
                      onChange={(e) => setStat(s, Number(e.target.value))}
                      placeholder={s}
                    />
                    <FieldHint text={`${s} score (0–100)`} />
                  </div>
                )
              )}
            </div>
          </Card>
        );

      /* ---------- Health ---------- */
      case 3:
        return (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Health</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  placeholder="Health Status (excellent/good/fair/...)"
                  value={form.health.status}
                  onChange={(e) => setHealth("status", e.target.value)}
                />
                <FieldHint text="Short overall health status" />
              </div>

              <div className="space-y-2">
                <Input
                  type="date"
                  value={form.health.lastCheckup}
                  onChange={(e) => setHealth("lastCheckup", e.target.value)}
                />
                <FieldHint text="Most recent medical checkup date" />
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Medical Notes"
                value={form.health.medicalNotes}
                onChange={(e) => setHealth("medicalNotes", e.target.value)}
              />
              <FieldHint text="Any medical details or recommendations" />
            </div>
          </Card>
        );

      /* ---------- Achievements ---------- */
      case 4:
        return (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Achievements</h3>
                <FieldHint text="Certificates, belts, competitions, workshops…" />
              </div>

              <Button type="button" variant="outline" onClick={addAchievement}>
                + Add Achievement
              </Button>
            </div>

            {form.achievements.length === 0 && (
              <div className="text-sm text-muted-foreground border rounded-lg p-4 bg-accent/10">
                No achievements added yet.
              </div>
            )}

            <div className="space-y-4">
              {form.achievements.map((a, i) => (
                <div
                  key={a.id}
                  className="border rounded-lg p-4 space-y-3 bg-accent/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Title"
                        value={a.title}
                        onChange={(e) =>
                          updateAchievement(i, "title", e.target.value)
                        }
                      />
                      <FieldHint text="e.g. Yellow Belt, National Championship" />
                    </div>

                    <div className="space-y-2">
                      <select
                        className="border rounded-md p-2 bg-background w-full"
                        value={a.type}
                        onChange={(e) =>
                          updateAchievement(
                            i,
                            "type",
                            e.target.value as AchievementType
                          )
                        }
                      >
                        <option value="competition">Competition</option>
                        <option value="belt">Belt</option>
                        <option value="workshop">Workshop</option>
                        <option value="certificate">Certificate</option>
                      </select>
                      <FieldHint text="Achievement category" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={a.date}
                        onChange={(e) =>
                          updateAchievement(i, "date", e.target.value)
                        }
                      />
                      <FieldHint text="Achievement date" />
                    </div>

                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAchievement(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Description"
                      value={a.description}
                      onChange={(e) =>
                        updateAchievement(i, "description", e.target.value)
                      }
                    />
                    <FieldHint text="Short description shown in timeline" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );

      /* ---------- Training Follow-up ---------- */
      case 5:
        return (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Training Follow-up</h3>
                <FieldHint text="Track attendance, focus, performance notes and coach remarks." />
              </div>

              <Button type="button" variant="outline" onClick={addTrainingLog}>
                + Add Session
              </Button>
            </div>

            {form.trainingLogs.length === 0 && (
              <div className="text-sm text-muted-foreground border rounded-lg p-4 bg-accent/10">
                No training sessions recorded.
              </div>
            )}

            <div className="space-y-4">
              {form.trainingLogs.map((log, i) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-3 bg-accent/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={log.date}
                        onChange={(e) =>
                          updateTrainingLog(i, "date", e.target.value)
                        }
                      />
                      <FieldHint text="Session date" />
                    </div>

                    <div className="space-y-2">
                      <Input
                        placeholder="Training Focus"
                        value={log.focus}
                        onChange={(e) =>
                          updateTrainingLog(i, "focus", e.target.value)
                        }
                      />
                      <FieldHint text="What was trained in this session" />
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={log.attendance ? "default" : "outline"}
                      onClick={() => updateTrainingLog(i, "attendance", true)}
                    >
                      Present
                    </Button>
                    <Button
                      type="button"
                      variant={!log.attendance ? "destructive" : "outline"}
                      onClick={() => updateTrainingLog(i, "attendance", false)}
                    >
                      Absent
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Performance Notes"
                      value={log.performanceNotes}
                      onChange={(e) =>
                        updateTrainingLog(i, "performanceNotes", e.target.value)
                      }
                    />
                    <FieldHint text="Short notes about performance" />
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Coach Remarks"
                      value={log.coachRemarks}
                      onChange={(e) =>
                        updateTrainingLog(i, "coachRemarks", e.target.value)
                      }
                    />
                    <FieldHint text="Coach comment shown in follow-up card" />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTrainingLog(i)}
                    >
                      Remove Session
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );

      /* ---------- Review ---------- */
      case 6:
        return (
          <div className="space-y-4">
            <ReviewSection title="Identity">
              <ReviewItem label="Name" value={form.name} />
              <ReviewItem label="National ID" value={form.nationalId} />
              <ReviewItem label="Gender" value={form.gender} />
              <ReviewItem label="Email" value={form.email} />
              <ReviewItem label="Phone" value={form.phone} />
            </ReviewSection>

            <ReviewSection title="Training">
              <ReviewItem label="Belt Level" value={form.beltLevel} />
              <ReviewItem label="Coach" value={form.coach} />
              <ReviewItem
                label="Training Start"
                value={
                  form.trainingStartDate
                    ? toDateLabel(form.trainingStartDate)
                    : ""
                }
              />
              <ReviewItem label="Current Focus" value={form.currentFocus} />
            </ReviewSection>

            <ReviewSection title="Performance Stats">
              {Object.entries(form.stats).map(([k, v]) => (
                <ReviewItem key={k} label={k} value={`${v}%`} />
              ))}
            </ReviewSection>

            <ReviewSection title="Health">
              <ReviewItem label="Status" value={form.health.status} />
              <ReviewItem
                label="Last Checkup"
                value={
                  form.health.lastCheckup
                    ? toDateLabel(form.health.lastCheckup)
                    : ""
                }
              />
              <ReviewItem
                label="Medical Notes"
                value={form.health.medicalNotes}
              />
            </ReviewSection>

            <ReviewSection title="Achievements">
              {form.achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No achievements added
                </p>
              ) : (
                <div className="space-y-2">
                  {form.achievements.map((a) => (
                    <div
                      key={a.id}
                      className="border rounded-md p-3 text-sm space-y-1 bg-accent/20"
                    >
                      <p className="font-semibold">{a.title || "Untitled"}</p>
                      <p className="text-muted-foreground">
                        {a.type} • {a.date ? toDateLabel(a.date) : "No date"}
                      </p>
                      {a.description && (
                        <p className="text-muted-foreground">{a.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ReviewSection>

            <ReviewSection title="Training Follow-up">
              {form.trainingLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No training sessions recorded
                </p>
              ) : (
                <div className="space-y-2">
                  {form.trainingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-md p-3 text-sm space-y-1 bg-accent/20"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {log.date ? toDateLabel(log.date) : "No date"}
                        </span>
                        <span
                          className={
                            log.attendance ? "text-green-600" : "text-red-600"
                          }
                        >
                          {log.attendance ? "Present" : "Absent"}
                        </span>
                      </div>

                      <p className="text-muted-foreground">
                        Focus: {log.focus || "—"}
                      </p>

                      {log.performanceNotes && (
                        <p className="italic">
                          Performance: {log.performanceNotes}
                        </p>
                      )}

                      {log.coachRemarks && (
                        <p className="italic text-muted-foreground">
                          Coach: {log.coachRemarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ReviewSection>

            <div className="border rounded-lg p-4 bg-primary/5 border-primary/20 text-sm">
              <p className="font-semibold mb-1">Ready to save?</p>
              <p className="text-muted-foreground">
                If something looks wrong, jump to the step above from the step
                bar and adjust it, then come back to Review.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!player) return null;

  /* ================= RENDER ================= */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>

        {/* STEP BAR */}
        <div className="flex gap-2 mb-4">
          {STEPS.map((s, i) => (
            <StepBadge
              key={s}
              index={i}
              label={s}
              active={i === step}
              completed={i < step}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {/* STEP CONTENT */}
        <StepContent />

        {/* NAVIGATION */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((x) => Math.max(0, x - 1))}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((x) => Math.min(STEPS.length - 1, x + 1))}
            >
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
