import React, { useEffect, useState } from "react";
import certificateService from "@/features/certificates/api/certificateService";
import { useParams } from "react-router-dom";
import CertificateView from "@/features/certificates/components/CertificateView";
import { downloadCertificateAsPDF } from "@/features/certificates/utils/useDownloadCertificate";

export default function CertificatePage() {
  const { id } = useParams(); // params: /cert/:id
  const [cert, setCert] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await certificateService.getCertificate(id);
      setCert(res.data.certificate);
    };
    load();
  }, [id]);

  if (!cert) return <p>Loading certificate...</p>;

  return (
    <div className="flex justify-center py-10 bg-muted">
      <CertificateView
        certificate={cert}
        onDownload={() => downloadCertificateAsPDF()}
      />
    </div>
  );
}
