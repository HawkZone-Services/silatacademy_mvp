import { Button } from "@/components/ui/button";

interface Props {
  examId: string;
  studentId: string;
}

export function CertificateDownloadButton({ examId, studentId }: Props) {
  const download = () => {
    const url = `https://api-f3rwhuz64a-uc.a.run.app/api/certificates/generate/${examId}/${studentId}`;
    window.open(url, "_blank");
  };

  return (
    <Button onClick={download} variant="outline" className="w-full mt-3">
      Download Certificate (PDF)
    </Button>
  );
}
