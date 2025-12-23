import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import examService from "@/services/examService";

interface Props {
  studentId: string;
  examId: string;
  finalPassed?: boolean;
  onFinalized?: () => void;
  practicalRecorded?: boolean;
}

export function FinalizeResultButton({
  studentId,
  examId,
  finalPassed,
  practicalRecorded,
  onFinalized,
}: Props) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<boolean>(Boolean(finalPassed));

  // Sync external finalPassed changes
  useEffect(() => {
    setDone(Boolean(finalPassed));
  }, [finalPassed]);

  if (!practicalRecorded || finalPassed) return null;

  const finalize = async () => {
    if (!studentId || !examId || loading || done) return;

    setLoading(true);

    try {
      // Axios returns: { data: { success, data:{ finalResult, certificate } } }
      const res = await examService.finalizeExam({ examId, studentId });

      const data = res?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Could not finalize result.");
      }

      const cert = data?.data?.certificate;

      toast({
        title: "Result Finalized",
        description: cert
          ? "Certificate created successfully."
          : "Scores saved. Certificate pending.",
      });

      // mark done so UI updates
      setDone(true);

      // trigger parent refresh
      onFinalized?.();

      // notify student dashboard if they are logged in later
      localStorage.setItem("refreshResults", "1");
      localStorage.setItem("refreshCertificates", "1");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message || "Finalize operation failed.",
      });
    }

    setLoading(false);
  };

  const isDisabled = loading || done || finalPassed || !studentId || !examId;

  return (
    <Button
      onClick={finalize}
      disabled={isDisabled}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
    >
      {loading
        ? "Finalizing..."
        : done || finalPassed
        ? "Finalized"
        : "Finalize Result"}
    </Button>
  );
}
