import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/shared/api/apiClient";

type CertificateCardProps = {
  certificate: any;
};

export function CertificateCard({ certificate }: CertificateCardProps) {
  const issuedAt = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString()
    : "-";

  const examId = certificate?.exam?._id || certificate?.examId;
  const studentId = certificate?.student || certificate?.player;
  const hasPdf = Boolean(examId && studentId);

  const handleDownload = () => {
    if (!hasPdf) return;
    window.open(`${API_BASE_URL}/certificates/pdf/${examId}/${studentId}`, "_blank");
  };

  return (
    <div className="border rounded-lg p-4 space-y-2 bg-accent/10">
      <div className="flex items-center gap-2">
        <div className="font-semibold text-lg">{certificate.title || "Certificate"}</div>
        {certificate.beltLevel && (
          <Badge variant="outline" className="capitalize text-xs">
            {certificate.beltLevel}
          </Badge>
        )}
      </div>
      <div className="text-sm text-muted-foreground">Issued: {issuedAt}</div>
      {!hasPdf && (
        <div className="text-xs text-muted-foreground">
          PDF not available for this certificate yet.
        </div>
      )}
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={!hasPdf}>
        Download PDF
      </Button>
    </div>
  );
}
