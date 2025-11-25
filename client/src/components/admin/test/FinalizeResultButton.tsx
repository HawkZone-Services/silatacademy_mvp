import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import examService from "@/services/examService";

interface Props {
  studentId: string;
  examId: string;
  finalPassed?: boolean;
  onFinalized?: () => void;
}

export function FinalizeResultButton({
  studentId,
  examId,
  finalPassed,
  onFinalized,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<boolean>(Boolean(finalPassed));

  useEffect(() => {
    setDone(Boolean(finalPassed));
  }, [finalPassed]);

  const finalize = async () => {
    if (!studentId || !examId || loading || done) return;

    setLoading(true);

    try {
      // 1) FINALIZE EXAM RESULT
      const res = await examService.finalizeExam({ examId, studentId });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        toast({
          variant: "destructive",
          title: "Finalize Failed",
          description: data.message || "Could not finalize result.",
        });
        return;
      }

      toast({
        title: "Result Finalized",
        description: data?.certificate
          ? "Certificate created successfully."
          : "Scores saved. Certificate pending.",
      });

      // 3) refresh admin submissions
      setDone(true);
      onFinalized?.();

      // 4) notify student dashboard
      localStorage.setItem("refreshResults", "1");
      localStorage.setItem("refreshCertificates", "1");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Finalize operation failed.",
      });
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={finalize}
      disabled={loading || done || finalPassed || !studentId || !examId}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
    >
      {loading ? "Finalizing..." : done || finalPassed ? "Finalized" : "Finalize Result"}
    </Button>
  );
}
