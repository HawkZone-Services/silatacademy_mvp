import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Props {
  studentId: string;
  examId: string;
}

export function CertificateGenerator({ studentId, examId }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const disabled = !studentId || !examId || loading;

  const generate = async () => {
    if (disabled) return;

    setLoading(true);

    try {
      const url = `https://api-f3rwhuz64a-uc.a.run.app/api/certificates/generate/${examId}/${studentId}`;
      window.open(url, "_blank");

      toast({
        title: "Certificate Generated",
        description: "The certificate has been opened in a new tab.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not generate certificate.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={generate}
      disabled={disabled}
      className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
    >
      {loading ? "Generating..." : "Generate Certificate"}
    </Button>
  );
}
