import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface Props {
  studentId: string;
  examId: string;
  studentName?: string;
  beltLevel?: string;
  finalPassed?: boolean;
}

export function CertificateGenerator({
  studentId,
  examId,
  studentName = "Student",
  beltLevel,
  finalPassed,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [certificateExists, setCertificateExists] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

  // ============================
  // CHECK CERT STATUS
  // ============================
  const checkCertificate = async () => {
    if (!studentId || !examId) return;

    try {
      const res = await fetch(
        `${API}/certificates/check/${examId}/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setCertificateExists(data.exists);
    } catch (err) {
      console.error("Certificate check failed:", err);
    }
  };

  useEffect(() => {
    checkCertificate();
  }, [studentId, examId]);

  // ============================
  // GENERATE / DOWNLOAD CERT PDF
  // ============================
  const generate = async () => {
    if (!studentId || !examId) return;
    setLoading(true);

    try {
      if (!certificateExists) {
        const createRes = await fetch(`${API}/certificates/generate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examId, studentId }),
        });
        const createJson = await createRes.json();
        if (!createRes.ok || !createJson?.success) {
          throw new Error(createJson?.message || "Finalize required");
        }
        setCertificateExists(true);
      }

      window.open(
        `${API}/certificates/admin/pdf/${examId}/${studentId}`,
        "_blank"
      );
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to generate certificate.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!certificateExists)
    return (
      <Button disabled className="w-full mt-4 bg-gray-400 text-white">
        Finalize Result to Unlock Certificate
      </Button>
    );

  return (
    <Button
      onClick={generate}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
    >
      {loading ? "Generating..." : "Download Certificate"}
    </Button>
  );
}
