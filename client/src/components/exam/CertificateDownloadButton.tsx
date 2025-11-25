import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/apiClient";

interface Props {
  examId: string;
  studentId: string;
}

export function CertificateDownloadButton({ examId, studentId }: Props) {
  const download = () => {
    const url = `${API_BASE_URL}/certificates/admin/pdf/${examId}/${studentId}`;
    window.open(url, "_blank");
  };

  return (
    <Button onClick={download} variant="outline" className="w-full mt-3">
      Download Certificate (PDF)
    </Button>
  );
}
