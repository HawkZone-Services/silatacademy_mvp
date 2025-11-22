import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

  const finalize = async () => {
    if (!studentId || !examId) return;

    setLoading(true);

    try {
      // 1) FINALIZE EXAM RESULT
      const res = await fetch(
        `${API}/exams/admin/finalize/${examId}/${studentId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Finalize Failed",
          description: data.message || "Could not finalize result.",
        });
        return;
      }

      // 2) CREATE CERTIFICATE DOCUMENT
      await fetch(`${API}/certificates/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId, studentId }),
      });

      toast({
        title: "Result Finalized",
        description: "Certificate created successfully.",
      });

      // 3) refresh admin submissions
      if (onFinalized) onFinalized();

      // 4) notify student dashboard
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
      disabled={loading || !studentId || !examId}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
    >
      {loading ? "Finalizing..." : "Finalize Result"}
    </Button>
  );
}
