import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Props {
  examId: string;
  studentId: string;
}

export const CertificateGenerator = ({ examId, studentId }: Props) => {
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<any>(null);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const generate = async () => {
    try {
      const res = await fetch(
        `https://api-f3rwhuz64a-uc.a.run.app/api/certificates/admin/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examId, studentId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Certificate Error",
          description: data.message || "Unable to generate certificate.",
        });
        return;
      }

      setCertificate(data.certificate);

      toast({
        title: "Certificate Created",
        description: "Student certificate has been generated.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-3">
      <Button className="w-full" onClick={generate}>
        Generate Certificate
      </Button>

      {certificate && (
        <div className="text-sm mt-3 p-3 bg-accent/10 rounded-lg">
          <p>
            <strong>Certificate Number:</strong> {certificate.certificateNumber}
          </p>
          <p>
            <strong>Issued:</strong>{" "}
            {new Date(certificate.issuedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};
