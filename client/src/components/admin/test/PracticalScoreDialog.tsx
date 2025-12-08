import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import examService from "@/services/examService";

interface Props {
  studentId: string;
  examId: string;
  finalPassed?: boolean;
  practicalRecorded?: boolean;
  onSaved?: () => void;
}

export function PracticalScoreDialog({
  studentId,
  examId,
  finalPassed,
  practicalRecorded,
  onSaved,
}: Props) {
  /** Block component entirely if:
   * - no student/exam
   * - OR exam finalized
   */
  if (!studentId || !examId || finalPassed) return null;

  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent overriding if exists
  const [hasExistingScores, setHasExistingScores] = useState(
    Boolean(practicalRecorded)
  );

  const [scores, setScores] = useState({
    morality: "",
    practicalMethod: "",
    technique: "",
    physical: "",
    mental: "",
  });

  const disabled = loading || !studentId || !examId || hasExistingScores;

  /* ============================================
        SUBMIT PRACTICAL SCORE
     ============================================ */
  const handleSubmit = async () => {
    if (disabled) return;

    const numericScores = Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, Number(v)])
    );

    // Validation
    for (const key in numericScores) {
      if (isNaN(numericScores[key]) || numericScores[key] < 0) {
        toast({
          title: "Invalid Score",
          description: `${key} must be a valid positive number.`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const res = await examService.savePracticalScore({
        studentId,
        examId,
        scores: numericScores,
      });

      const data = res?.data || res?.response?.data || res || {};

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save practical score");
      }

      toast({
        title: "Practical Score Saved",
        description: "The practical evaluation has been recorded.",
      });

      setOpen(false);
      setHasExistingScores(true);

      onSaved?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save practical score.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  /* ============================================
        RENDER
     ============================================ */
  return (
    <>
      {/* BUTTON (OPEN MODAL) */}
      {!hasExistingScores ? (
        <Button
          disabled={disabled}
          onClick={() => setOpen(true)}
          variant="outline"
        >
          {loading ? "Loading..." : "Add Practical Score"}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button disabled variant="secondary">
            Practical Score Recorded
          </Button>
          <p className="text-xs text-muted-foreground">
            Scores already recorded and cannot be overwritten.
          </p>
        </div>
      )}

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Practical Evaluation {loading && "(Saving…)"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {Object.keys(scores).map((field) => (
              <div key={field}>
                <label className="text-sm capitalize">{field}</label>
                <Input
                  type="number"
                  value={(scores as any)[field]}
                  onChange={(e) =>
                    setScores({ ...scores, [field]: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Practical Score"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
