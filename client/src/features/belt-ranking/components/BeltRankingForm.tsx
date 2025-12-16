import { useState, useEffect } from "react";
import { BeltRanking } from "../types/beltRanking.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  initialData?: BeltRanking | null;
  onSubmit: (data: Partial<BeltRanking>) => Promise<void>;
  onCancel: () => void;
}

/* ✅ Default safe form */
const DEFAULT_FORM: Partial<BeltRanking> = {
  name: "",
  level: "",
  order: 0,
  attendance: {
    requiredSessions: 0,
    requiredHours: 0,
    minRate: 70,
  },
  lessons: {
    totalLessons: 0,
    unlockEvery: 5,
  },
  requirements: [],
};

const helper = "text-xs text-muted-foreground mt-1";

export default function BeltRankingForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<Partial<BeltRanking>>(DEFAULT_FORM);
  const [requirementInput, setRequirementInput] = useState("");

  /* ✅ Safe merge for edit mode */
  useEffect(() => {
    if (initialData) {
      setForm({
        ...DEFAULT_FORM,
        ...initialData,
        attendance: {
          ...DEFAULT_FORM.attendance,
          ...initialData.attendance,
        },
        lessons: {
          ...DEFAULT_FORM.lessons,
          ...initialData.lessons,
        },
        requirements: initialData.requirements || [],
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [initialData]);

  const update = (path: string, value: any) => {
    setForm((prev: any) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let cur = updated;
      keys.slice(0, -1).forEach((k) => {
        cur[k] = { ...cur[k] };
        cur = cur[k];
      });
      cur[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  /* ===== Requirements ===== */
  const addRequirement = () => {
    if (!requirementInput.trim()) return;
    update("requirements", [
      ...(form.requirements || []),
      requirementInput.trim(),
    ]);
    setRequirementInput("");
  };

  const removeRequirement = (index: number) => {
    update(
      "requirements",
      (form.requirements || []).filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Belt Ranking" : "Create Belt Ranking"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* BASIC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Belt Name</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="White Belt"
            />
            <p className={helper}>
              Display name of the belt shown to students.
            </p>
          </div>

          <div>
            <Label>Level</Label>
            <Input
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              placeholder="Beginner"
            />
            <p className={helper}>
              Difficulty level (Beginner, Intermediate, Advanced).
            </p>
          </div>

          <div>
            <Label>Order</Label>
            <Input
              type="number"
              value={form.order}
              onChange={(e) => update("order", +e.target.value)}
            />
            <p className={helper}>
              Determines the belt sequence (lower comes first).
            </p>
          </div>
        </div>

        {/* ATTENDANCE */}
        <div>
          <h4 className="font-semibold mb-2">Attendance Rules</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Required Sessions"
                value={form.attendance!.requiredSessions}
                onChange={(e) =>
                  update("attendance.requiredSessions", +e.target.value)
                }
              />
              <p className={helper}>Minimum number of sessions required.</p>
            </div>

            <div>
              <Input
                type="number"
                placeholder="Required Hours"
                value={form.attendance!.requiredHours}
                onChange={(e) =>
                  update("attendance.requiredHours", +e.target.value)
                }
              />
              <p className={helper}>Total training hours required.</p>
            </div>

            <div>
              <Input
                type="number"
                placeholder="Min Rate %"
                value={form.attendance!.minRate}
                onChange={(e) => update("attendance.minRate", +e.target.value)}
              />
              <p className={helper}>Minimum attendance percentage (0–100).</p>
            </div>
          </div>
        </div>

        {/* LESSONS */}
        <div>
          <h4 className="font-semibold mb-2">Lesson Rules</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Total Lessons"
                value={form.lessons!.totalLessons}
                onChange={(e) =>
                  update("lessons.totalLessons", +e.target.value)
                }
              />
              <p className={helper}>Total lessons required for this belt.</p>
            </div>

            <div>
              <Input
                type="number"
                placeholder="Unlock every X sessions"
                value={form.lessons!.unlockEvery}
                onChange={(e) => update("lessons.unlockEvery", +e.target.value)}
              />
              <p className={helper}>
                New lesson unlocked after every X sessions.
              </p>
            </div>
          </div>
        </div>

        {/* REQUIREMENTS */}
        <div className="space-y-3">
          <Label>Requirements</Label>

          <div>
            <div className="flex gap-2">
              <Input
                placeholder="Add requirement"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRequirement()}
              />
              <Button type="button" onClick={addRequirement}>
                Add
              </Button>
            </div>
            <p className={helper}>
              Add specific skills or tasks students must complete.
            </p>
          </div>

          <ul className="space-y-2">
            {(form.requirements || []).map((req, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span className="text-sm">{req}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? "Update" : "Create"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
