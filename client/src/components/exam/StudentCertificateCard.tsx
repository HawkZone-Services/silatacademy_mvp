import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StudentCertificateCardProps {
  certificate: {
    _id: string;
    beltLevel: string;
    totalScore: number;
    issuedAt: string;
    exam?: {
      _id?: string;
      title?: string;
      maxTheoryScore?: number;
    };
  };
  studentName: string;
}

export function StudentCertificateCard({
  certificate,
  studentName,
}: StudentCertificateCardProps) {
  const certRef = useRef<HTMLDivElement | null>(null);

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString();
  const examTitle = certificate.exam?.title || "Pencak Silat Exam";

  const verifyUrl = `https://silatacademy.com/verify/certificate/${certificate._id}`;

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;

    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`certificate-${certificate._id}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div
        ref={certRef}
        className="
          relative mx-auto max-w-4xl aspect-video
          bg-gradient-to-br from-zinc-900 via-zinc-950 to-black
          flex items-center justify-center
          shadow-2xl
        "
      >
        {/* outer gold frame */}
        <div
          className="
            absolute inset-4
            rounded-[32px]
            border-[8px]
            border-yellow-500
            shadow-[0_0_25px_rgba(234,179,8,0.8)]
          "
        />

        {/* inner frame */}
        <div
          className="
            absolute inset-8
            rounded-[24px]
            border-[3px]
            border-yellow-300/70
            bg-gradient-to-br from-zinc-950/90 via-zinc-900/95 to-black/90
            backdrop-blur-sm
          "
        />

        {/* content */}
        <div className="relative z-10 px-16 py-10 w-full h-full flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.25em] text-yellow-200/80 uppercase">
                Silat Academy
              </p>
              <h1 className="text-3xl font-semibold text-yellow-100 mt-1">
                Certificate of Achievement
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-300">Certificate ID</p>
              <p className="text-sm font-mono text-yellow-200">
                #{certificate._id.slice(-8).toUpperCase()}
              </p>
              <Badge
                variant="outline"
                className="mt-2 border-yellow-400/80 text-yellow-200 bg-yellow-500/5"
              >
                {certificate.beltLevel} Belt
              </Badge>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-xs tracking-[0.35em] text-yellow-200/70 uppercase">
              This is to certify that
            </p>

            <p className="text-4xl font-bold text-yellow-50 tracking-wide">
              {studentName}
            </p>

            <p className="text-sm text-zinc-200 max-w-2xl">
              has successfully completed the{" "}
              <span className="font-semibold text-yellow-200">{examTitle}</span>{" "}
              and demonstrated the required{" "}
              <span className="font-semibold">
                technical, physical, and mental
              </span>{" "}
              competencies for the{" "}
              <span className="font-semibold text-yellow-200">
                {certificate.beltLevel} Belt
              </span>{" "}
              level in Pencak Silat.
            </p>

            <div className="flex items-center gap-8 mt-4">
              <div className="text-left">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">
                  Total Score
                </p>
                <p className="text-xl font-semibold text-yellow-100">
                  {certificate.totalScore} / 100
                </p>
              </div>

              <div className="text-left">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">
                  Issued On
                </p>
                <p className="text-sm font-medium text-yellow-100">
                  {issuedDate}
                </p>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="mt-6 flex items-end justify-between">
            <div className="flex flex-col items-start">
              <div className="h-[1px] w-40 bg-yellow-300/70 mb-1" />
              <p className="text-sm text-yellow-100 font-medium">
                Head Coach / Examiner
              </p>
              <p className="text-xs text-zinc-300">
                Pencak Silat Academy • Official Grading
              </p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="bg-white p-2 rounded-md shadow-md">
                <QRCodeSVG value={verifyUrl} size={72} />
              </div>
              <p className="text-[10px] text-zinc-300 uppercase tracking-[0.2em]">
                Verify Certificate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadPdf}
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
}
