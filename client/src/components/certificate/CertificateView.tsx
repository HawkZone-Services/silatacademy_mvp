import React from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";

interface CertificateViewProps {
  certificate: any; // full populated cert from backend
  onDownload?: () => void;
}

export default function CertificateView({
  certificate,
  onDownload,
}: CertificateViewProps) {
  const student = certificate.user;
  const serial = certificate._id;
  const issuedAt = new Date(certificate.issuedAt).toLocaleDateString();

  return (
    <div
      id="certificate"
      className="relative mx-auto bg-white shadow-xl border-[10px] border-[#b19763] rounded-xl p-10 w-[900px] h-[650px] flex flex-col justify-between"
      style={{
        backgroundImage: "url('https://i.imgur.com/Vbc3Z87.png')", // pattern subtle
        backgroundSize: "cover",
      }}
    >
      {/* TOP HEADER */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#b19763] tracking-wide">
          SILAT ACADEMY
        </h2>
        <p className="text-gray-500 text-sm -mt-1">
          Certificate of Achievement
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="text-center mt-4">
        <h3 className="text-xl text-gray-700 tracking-wide">
          This certificate is proudly awarded to
        </h3>

        <h1 className="text-4xl font-extrabold text-black my-4">
          {student?.name}
        </h1>

        <p className="text-lg text-gray-700">For successfully completing:</p>

        <h2 className="text-2xl font-semibold text-[#b19763] mt-3">
          {certificate.title}
        </h2>

        <p className="mt-2 text-gray-600 max-w-[700px] mx-auto">
          {certificate.description}
        </p>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-end px-6 mt-10">
        {/* ISSUE DATE */}
        <div className="text-left text-gray-600">
          <p className="text-sm">Issued On:</p>
          <p className="font-semibold">{issuedAt}</p>
        </div>

        {/* SIGNATURE */}
        <div className="text-center">
          <img
            src="/signature.png"
            alt="signature"
            className="h-16 opacity-80 mx-auto"
          />
          <p className="text-gray-700 font-semibold mt-1">Academy Director</p>
        </div>

        {/* QR CODE */}
        <div className="text-right">
          <QRCode
            value={`https://your-domain.com/cert/verify/${serial}`}
            size={80}
          />
          <p className="text-xs text-gray-500 mt-1">ID: {serial}</p>
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      {onDownload && (
        <Button
          onClick={onDownload}
          className="absolute bottom-4 right-4 shadow-lg"
        >
          Download PDF
        </Button>
      )}
    </div>
  );
}
