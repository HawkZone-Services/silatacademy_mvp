import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface Props {
  studentId: string;
  examId: string;
}

export function CertificateGenerator({ studentId, examId }: Props) {
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
    if (!certificateExists) {
      toast({
        variant: "destructive",
        title: "Finalize Required",
        description:
          "You must finalize the result before generating certificate.",
      });
      return;
    }

    setLoading(true);

    try {
      const url = `${API}/certificates/admin/pdf/${examId}/${studentId}`;
      window.open(url, "_blank");

      toast({
        title: "Certificate Ready",
        description: "Opened in new tab.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate certificate.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // UI States
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
