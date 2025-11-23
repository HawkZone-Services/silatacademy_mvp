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
  if (!studentId || !examId || finalPassed) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasExistingScores, setHasExistingScores] = useState(
    Boolean(practicalRecorded)
  );
  const { toast } = useToast();

  const [scores, setScores] = useState({
    morality: "",
    practicalMethod: "",
    technique: "",
    physical: "",
    mental: "",
  });

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const disabled = !studentId || !examId || loading;

  const handleSubmit = async () => {
    if (disabled || practicalRecorded) return;

    setLoading(true);

    try {
      const res = await fetch(
        "https://api-f3rwhuz64a-uc.a.run.app/api/exams/admin/practical/score",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            examId,
            ...Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, Number(v)])
            ),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to save practical score");
      }

      toast({
        title: "Practical Score Saved",
        description: "The practical evaluation has been recorded.",
      });

      setOpen(false);
      setHasExistingScores(true);
      onSaved?.();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save practical score.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <>
      {!hasExistingScores && !practicalRecorded ? (
        <Button
          disabled={!studentId || !examId || loading}
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
