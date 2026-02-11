import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card } from "@/shared/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import adminService from "@/features/gates/admin/api/adminService";
import { UserPlus } from "lucide-react";

/* ================= HELPERS ================= */

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random()}`;

function FieldHint({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground">{text}</p>;
}

function StepBadge({ index, label, active, completed, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition
        ${active ? "bg-primary text-white" : ""}
        ${completed && !active ? "bg-green-500/10 text-green-600" : ""}
        ${!active && !completed ? "bg-accent/30 text-muted-foreground" : ""}
      `}
    >
      {index + 1}. {label}
    </button>
  );
}

function ReviewItem({ label, value }: { label: string; value: any }) {
  if (!value && value !== 0) return null;
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
    <Card className="p-4 space-y-2">
      <h4 className="font-semibold text-xs uppercase tracking-wide text-secondary">
        {title}
      </h4>
      {children}
    </Card>
  );
}

/* ================= STEPS ================= */

const STEPS = [
  "Identity",
  "Contact",
  "Training",
  "Stats",
  "Health",
  "Achievements",
  "Training Follow-up",
  "Review",
];

/* ================= COMPONENT ================= */

export function AddPlayerDialog({ onPlayerAdded }: any) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const initialForm = useMemo(
    () => ({
      name: "",
      nationalId: "",
      dob: "",
      gender: "male",

      email: "",
      phone: "",

      password: "",
      beltLevel: "white",
      beltColor: "",
      height: "",
      weight: "",
      coach: "",
      trainingStartDate: "",
      currentFocus: "",

      stats: { power: 0, flexibility: 0, endurance: 0, speed: 0 },

      health: {
        status: "excellent",
        lastCheckup: "",
        nutritionPlan: "",
        restSchedule: "",
        medicalNotes: "",
        injuries: [] as string[],
      },

      achievements: [] as any[],
      trainingLogs: [] as any[],
    }),
    []
  );

  const [form, setForm] = useState<any>(initialForm);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const setStat = (k: string, v: number) =>
    setForm((p: any) => ({ ...p, stats: { ...p.stats, [k]: v } }));
  const setHealth = (k: string, v: any) =>
    setForm((p: any) => ({
      ...p,
      health: { ...p.health, [k]: v },
    }));

  /* ================= ACHIEVEMENTS ================= */

  const addAchievement = () =>
    set("achievements", [
      ...form.achievements,
      {
        id: uid(),
        title: "",
        type: "certificate",
        date: "",
        description: "",
      },
    ]);

  const updateAchievement = (i: number, k: string, v: any) => {
    const arr = [...form.achievements];
    arr[i] = { ...arr[i], [k]: v };
    set("achievements", arr);
  };

  /* ================= TRAINING LOGS ================= */

  const addTrainingLog = () =>
    set("trainingLogs", [
      ...form.trainingLogs,
      {
        id: uid(),
        date: "",
        focus: "",
        attendance: true,
        performanceNotes: "",
        coachRemarks: "",
      },
    ]);

  const updateTrainingLog = (i: number, k: string, v: any) => {
    const logs = [...form.trainingLogs];
    logs[i] = { ...logs[i], [k]: v };
    set("trainingLogs", logs);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.name || !form.nationalId || !form.password) {
      toast({
        title: "Missing data",
        description: "Name, National ID and Password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const age = form.dob
        ? new Date().getFullYear() - new Date(form.dob).getFullYear()
        : null;

      await adminService.createPlayer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        nationalId: form.nationalId,
        dob: form.dob,
        gender: form.gender,
        password: form.password,
        playerData: {
          beltLevel: form.beltLevel,
          beltColor: form.beltColor,
          age,
          height: form.height,
          weight: form.weight,
          coach: form.coach,
          trainingStartDate: form.trainingStartDate,
          trainingYears: form.trainingStartDate
            ? new Date().getFullYear() -
              new Date(form.trainingStartDate).getFullYear()
            : 0,
          currentFocus: form.currentFocus,
          stats: form.stats,
          health: form.health,
          achievements: form.achievements,
          trainingLogs: form.trainingLogs,
        },
      });

      toast({ title: "Player added successfully" });
      setForm(initialForm);
      setStep(0);
      setOpen(false);
      onPlayerAdded?.();
    } catch {
      toast({
        title: "Failed to add player",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP CONTENT ================= */

  const StepContent = () => {
    switch (step) {
      case 0:
        return (
          <Card className="p-6 space-y-4">
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <FieldHint text="Legal full name of the athlete" />

            <Input
              placeholder="National ID"
              value={form.nationalId}
              onChange={(e) => set("nationalId", e.target.value)}
            />
            <FieldHint text="Required for official records" />

            <Input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
            />

            <div className="flex gap-2">
              {["male", "female"].map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={form.gender === g ? "default" : "outline"}
                  onClick={() => set("gender", g)}
                >
                  {g}
                </Button>
              ))}
            </div>
          </Card>
        );

      case 1:
        return (
          <Card className="p-6 space-y-4">
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <FieldHint text="Used for login and notifications" />

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Card>
        );

      case 2:
        return (
          <Card className="p-6 space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            <FieldHint text="Initial login password" />

            <Input
              placeholder="Coach"
              value={form.coach}
              onChange={(e) => set("coach", e.target.value)}
            />

            <Input
              type="date"
              value={form.trainingStartDate}
              onChange={(e) => set("trainingStartDate", e.target.value)}
            />

            <Input
              placeholder="Current Training Focus"
              value={form.currentFocus}
              onChange={(e) => set("currentFocus", e.target.value)}
            />
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 space-y-4">
            {Object.keys(form.stats).map((s) => (
              <div key={s}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.stats[s]}
                  onChange={(e) => setStat(s, Number(e.target.value))}
                />
                <FieldHint text={`${s} score (0–100)`} />
              </div>
            ))}
          </Card>
        );

      case 4:
        return (
          <Card className="p-6 space-y-4">
            <Input
              placeholder="Health Status"
              value={form.health.status}
              onChange={(e) => setHealth("status", e.target.value)}
            />
            <Input
              type="date"
              value={form.health.lastCheckup}
              onChange={(e) => setHealth("lastCheckup", e.target.value)}
            />
            <Textarea
              placeholder="Medical Notes"
              value={form.health.medicalNotes}
              onChange={(e) => setHealth("medicalNotes", e.target.value)}
            />
          </Card>
        );

      case 5:
        return (
          <Card className="p-6 space-y-4">
            {form.achievements.map((a: any, i: number) => (
              <div key={a.id} className="border p-3 rounded space-y-2">
                <Input
                  placeholder="Title"
                  value={a.title}
                  onChange={(e) =>
                    updateAchievement(i, "title", e.target.value)
                  }
                />
                <Input
                  type="date"
                  value={a.date}
                  onChange={(e) => updateAchievement(i, "date", e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={a.description}
                  onChange={(e) =>
                    updateAchievement(i, "description", e.target.value)
                  }
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAchievement}>
              + Add Achievement
            </Button>
          </Card>
        );

      case 6:
        return (
          <Card className="p-6 space-y-4">
            {form.trainingLogs.map((l: any, i: number) => (
              <div key={l.id} className="border p-3 rounded space-y-2">
                <Input
                  type="date"
                  value={l.date}
                  onChange={(e) => updateTrainingLog(i, "date", e.target.value)}
                />
                <Input
                  placeholder="Focus"
                  value={l.focus}
                  onChange={(e) =>
                    updateTrainingLog(i, "focus", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Performance Notes"
                  value={l.performanceNotes}
                  onChange={(e) =>
                    updateTrainingLog(i, "performanceNotes", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Coach Remarks"
                  value={l.coachRemarks}
                  onChange={(e) =>
                    updateTrainingLog(i, "coachRemarks", e.target.value)
                  }
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTrainingLog}>
              + Add Training Session
            </Button>
          </Card>
        );

      case 7:
        return (
          <div className="space-y-4">
            <ReviewSection title="Identity">
              <ReviewItem label="Name" value={form.name} />
              <ReviewItem label="National ID" value={form.nationalId} />
              <ReviewItem label="Gender" value={form.gender} />
              <ReviewItem label="DOB" value={form.dob} />
            </ReviewSection>

            <ReviewSection title="Contact">
              <ReviewItem label="Email" value={form.email} />
              <ReviewItem label="Phone" value={form.phone} />
            </ReviewSection>

            <ReviewSection title="Training">
              <ReviewItem label="Coach" value={form.coach} />
              <ReviewItem
                label="Training Start"
                value={form.trainingStartDate}
              />
              <ReviewItem label="Focus" value={form.currentFocus} />
            </ReviewSection>

            <ReviewSection title="Stats">
              {Object.entries(form.stats).map(([k, v]) => (
                <ReviewItem key={k} label={k} value={`${v}%`} />
              ))}
            </ReviewSection>

            <ReviewSection title="Health">
              <ReviewItem label="Status" value={form.health.status} />
              <ReviewItem
                label="Medical Notes"
                value={form.health.medicalNotes}
              />
            </ReviewSection>

            <ReviewSection title="Achievements">
              {form.achievements.length === 0
                ? "No achievements"
                : form.achievements.map((a: any) => a.title).join(", ")}
            </ReviewSection>

            <ReviewSection title="Training Follow-up">
              {form.trainingLogs.length === 0
                ? "No sessions"
                : form.trainingLogs.map((l: any) => l.date).join(", ")}
            </ReviewSection>
          </div>
        );
    }
  };

  /* ================= RENDER ================= */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" /> Add Player
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>

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

        <StepContent />

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add Player"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
