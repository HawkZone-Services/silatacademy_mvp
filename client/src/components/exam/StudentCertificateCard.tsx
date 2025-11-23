import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

import StudentCertificateFront from "@/components/certificate/StudentCertificateFront";
import StudentCertificateBack from "@/components/certificate/StudentCertificateBack";

interface StudentCertificateCardProps {
  certificate: {
    _id: string;
    beltLevel?: string;
    totalScore?: number;
    issuedAt?: string;
    scores?: {
      morality?: number;
      method?: number;
      technique?: number;
      physical?: number;
      mental?: number;
      total?: number;
    };
    exam?: {
      title?: string;
      beltLevel?: string;
    };
  };
  studentName: string;
}

export function StudentCertificateCard({
  certificate,
  studentName,
}: StudentCertificateCardProps) {
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------------------------------------------------
   *                 GENERATE PDF (FRONT + BACK)
   * ------------------------------------------------------------------ */
  const handleDownloadPdf = async () => {
    const pdf = new jsPDF("portrait", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    /* ---- FRONT PAGE ---- */
    if (frontRef.current) {
      const canvasFront = await html2canvas(frontRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgFront = canvasFront.toDataURL("image/png");
      const imgHeight = (canvasFront.height * pdfWidth) / canvasFront.width;

      pdf.addImage(imgFront, "PNG", 0, 0, pdfWidth, imgHeight);
    }

    /* ---- BACK PAGE ---- */
    if (backRef.current) {
      pdf.addPage();

      const canvasBack = await html2canvas(backRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgBack = canvasBack.toDataURL("image/png");
      const imgHeight = (canvasBack.height * pdfWidth) / canvasBack.width;

      pdf.addImage(imgBack, "PNG", 0, 0, pdfWidth, imgHeight);
    }

    pdf.save(`certificate-${certificate._id}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* FRONT PAGE */}
      <StudentCertificateFront
        certificate={certificate}
        studentName={studentName}
        frontRef={frontRef}
      />

      {/* BACK PAGE */}
      <StudentCertificateBack certificate={certificate} backRef={backRef} />

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadPdf}
        >
          Download PDF (2 Pages)
        </Button>
      </div>
    </div>
  );
}
