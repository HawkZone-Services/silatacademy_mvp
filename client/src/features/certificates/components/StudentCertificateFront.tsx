import React from "react";
import heroSilat from "@/assets/hero-silat.jpg";
import patternBg from "@/assets/pattern-bg.jpg";
import persilat from "@/assets/logos/persilat.png";
import egypt from "@/assets/logos/ecps.png";
import tradisi from "@/assets/logos/fpsti.png";
import ecps_watermark from "@/assets/ecps_watermark.png";

type CertificateData = {
  _id: string;
  beltLevel?: string;
  issuedAt?: string;
  exam?: { title?: string };
};

interface Props {
  frontRef: React.RefObject<HTMLDivElement>;
  certificate: CertificateData;
  studentName: string;
}

export const StudentCertificateFront = ({
  frontRef,
  certificate,
  studentName,
}: Props) => {
  const beltLevel = certificate.beltLevel || "الحزام";
  const issuedAt = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString()
    : "-";
  const beltArt = patternBg;

  return (
    <div
      ref={frontRef}
      className="
        relative 
        bg-[#fbf8cc]
        w-[210mm] 
        h-[297mm] 
        overflow-hidden 
        text-center 
        py-3 
        px-5 
        mx-auto
        select-none
      "
    >
      {/* Watermark */}
      <img
        src={ecps_watermark}
        alt="Watermark"
        className="
          absolute 
          top-1/2 
          left-1/2 
          w-[70%] 
          opacity-20 
          -translate-x-1/2 
          -translate-y-1/2 
          pointer-events-none
          z-0
        "
      />

      <div className="relative z-10">
        {/* Certificate ID */}
        <p className="text-left text-[18px] font-[MyCustomFont] pt-2">
          No. {certificate?._id}
        </p>

        {/* Logos Row */}
        <div className="flex justify-center gap-2 pt-2">
          <img src={persilat} className="w-[80px] h-[80px] rounded-full" />
          <img src={egypt} className="w-[90px] h-[90px] rounded-full" />
          <img src={tradisi} className="w-[80px] h-[80px] rounded-full" />
        </div>

        {/* Belt Image */}
        <div className="flex justify-center relative z-10 mt-[-1%] mb-[-13%]">
          {/*<img src={beltArt} className="w-full h-full scale-[0.9]" />*/}
        </div>

        {/* Main Titles */}
        <p className="text-[30px] font-bold" style={{ fontFamily: "PTBOLD" }}>
          شهادة إجتياز حزام
        </p>

        <p
          className="text-[35px] font-bold text-blue-900 mt-[-1%]"
          style={{ fontFamily: "PTBOLD" }}
        >
          جمهورية مصر العربية
        </p>

        <p
          className="text-[35px] font-bold text-red-800"
          style={{ fontFamily: "PTBOLD" }}
        >
          اللجنة العليا للبنجاك سيلات
        </p>

        {/* Description */}
        <p
          className="text-[25px] text-gray-600 font-semibold w-full pt-2 leading-relaxed"
          style={{ fontFamily: "PTBOLD" }}
        >
          بناءاً على نتائج الإختبار النهائي لدرجة الحزام {beltLevel} والذي أقيم
          <br /> في Silat Academy بتاريخ {issuedAt} للطالب / الطالبة
        </p>

        {/* Student Name */}
        <p
          className="underline text-gray-600 text-[55px] font-bold mb-2"
          style={{ fontFamily: "PTBOLD" }}
        >
          {studentName}
        </p>

        {/* Birth + Club Row */}
        <div className="flex justify-between w-full px-8 py-2">
          <p
            className="text-[20px] font-semibold text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            نادي / هيئة خاصة: {issuedAt}
          </p>

          <p
            className="text-[20px] font-semibold text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            تاريخ الميلاد : -
          </p>
        </div>

        {/* Achievement Line */}
        <p
          className="text-[22px] font-medium py-1 text-gray-600"
          style={{ fontFamily: "PTBOLD" }}
        >
          قد إجتاز الإختبار بكفاءة وحصل على درجة المستوى {beltLevel} في بنجاك
          سيلات مصر
        </p>

        {/* Belt Level Title */}
        <p
          className="text-[30px] font-semibold text-gray-600"
          style={{ fontFamily: "PTBOLD" }}
        >
          الحزام {beltLevel}
        </p>

        <p
          className="text-[22px] font-medium py-1 text-gray-600"
          style={{ fontFamily: "PTBOLD" }}
        >
          (FPSTI) - وقد تم إعتماد حزام المستوى {beltLevel} من قبل الإتحاد الدولي
        </p>

        {/* Avatar + Approval Date */}
        <div className="flex justify-between mt-2 mb-[-8px] px-3">
          {/**
          * 
           <img
            src={heroSilat}
            className="h-[180px] w-auto object-cover rounded-md border"
          />
          */}

          <p
            className="text-[20px] font-semibold text-right text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            القاهرة : {issuedAt}
          </p>
        </div>

        {/* Trainers Board */}
        <div className="flex flex-col gap-5 mt-[-6%]">
          <p
            className="text-[23px] font-semibold text-center text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            رؤساء مجلس التدريب
          </p>

          <div className="flex justify-around gap-8 text-[18px] text-gray-600">
            {[
              "أحمد هاني رجب",
              "محمد فوزي إمام",
              "منة الله محمود",
              "مازن الضاهر",
            ].map((name) => (
              <div key={name} className="text-center">
                <p>{name}</p>
                <div className="border-b border-black my-1 text-gray-600" />
                <p>بندكار</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCertificateFront;
