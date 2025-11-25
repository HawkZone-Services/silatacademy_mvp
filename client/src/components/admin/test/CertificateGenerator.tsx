import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import certificateService from "@/services/certificateService";
import { API_BASE_URL } from "@/lib/apiClient";

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

  // ============================
  // CHECK CERT STATUS
  // ============================
  const checkCertificate = async () => {
    if (!studentId || !examId) return;

    try {
      const res = await certificateService.checkCertificate(
        examId,
        studentId
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
        const createRes = await certificateService.generateCertificate({
          examId,
          studentId,
        });
        const createJson = await createRes.json();
        if (!createRes.ok || !createJson?.success) {
          throw new Error(createJson?.message || "Finalize required");
        }
        setCertificateExists(true);
      }

      window.open(
        `${API_BASE_URL}/certificates/admin/pdf/${examId}/${studentId}`,
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
