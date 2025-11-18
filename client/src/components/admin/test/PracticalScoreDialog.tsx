import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PracticalScoreDialog({ studentId, examId, onSaved }: any) {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState({
    morality: 0,
    practicalMethod: 0,
    technique: 0,
    physical: 0,
    mental: 0,
  });

  const submit = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    await fetch(
      `https://api-f3rwhuz64a-uc.a.run.app/api/exams/practical/score`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...scores, studentId, examId }),
      }
    );

    onSaved();
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Add Practical Score
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Practical Evaluation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {Object.entries(scores).map(([field, value]) => (
              <Input
                key={field}
                type="number"
                placeholder={`${field} Score`}
                value={value}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [field]: Number(e.target.value),
                  }))
                }
              />
            ))}
            <Button onClick={submit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
