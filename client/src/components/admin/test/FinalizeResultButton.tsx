import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  studentId: string;
  examId: string;
  onFinalized?: () => void;
}

export function FinalizeResultButton({
  studentId,
  examId,
  onFinalized,
}: Props) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const disabled = !studentId || !examId || loading;

  const finalize = async () => {
    if (disabled) return;
    setLoading(true);

    try {
      const res = await fetch(
        "https://api-f3rwhuz64a-uc.a.run.app/api/exams/admin/finalize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            examId,
          }),
        }
      );

      const data = await res.json();

      toast({
        title: "Final Result Saved",
        description: "The exam result has been finalized.",
      });

      onFinalized?.();
    } catch {
      toast({
        title: "Error",
        description: "Could not finalize result.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={finalize}
      disabled={disabled}
      className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
    >
      {loading ? "Finalizing..." : "Finalize Result"}
    </Button>
  );
}
