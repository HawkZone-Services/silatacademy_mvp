import React from "react";
import ecps_watermark from "@/assets/ecps_watermark.png";

type CertificateData = {
  _id: string;
  scores?: {
    morality?: number;
    method?: number;
    technique?: number;
    physical?: number;
    mental?: number;
    total?: number;
  };
  totalScore?: number;
};

interface Props {
  backRef: React.RefObject<HTMLDivElement>;
  certificate: CertificateData;
}

export const StudentCertificateBack = ({ backRef, certificate }: Props) => {
  const points = [
    { id: 1, title: "morality", point: certificate.scores?.morality ?? 0 },
    { id: 2, title: "Method", point: certificate.scores?.method ?? 0 },
    { id: 3, title: "Technique", point: certificate.scores?.technique ?? 0 },
    { id: 4, title: "physical", point: certificate.scores?.physical ?? 0 },
    { id: 5, title: "mental", point: certificate.scores?.mental ?? 0 },
  ];

  const totalScore =
    certificate.totalScore ??
    certificate.scores?.total ??
    points.reduce((sum, p) => sum + p.point, 0);

  const getLetterGrade = (score: number) => {
    if (score > 80) return "A";
    if (score > 70) return "B";
    if (score > 60) return "C";
    return "D";
  };

  const getDescription = (letter: string) => {
    switch (letter) {
      case "A":
        return "Very Well";
      case "B":
        return "Well";
      case "C":
        return "Enough";
      case "D":
        return "Less";
      default:
        return "";
    }
  };

  const overallPerformance =
    totalScore >= 400
      ? "VERY WELL"
      : totalScore >= 300
      ? "WELL"
      : totalScore >= 200
      ? "ENOUGH"
      : "LESS";

  return (
    <div
      ref={backRef}
      className="
        relative 
        w-[210mm] h-[297mm]
        bg-[#fbf8cc]
        overflow-hidden 
        text-center 
        py-3 px-5  
        mx-auto
        select-none
        flex flex-col
      "
    >
      <img
        src={ecps_watermark}
        className="
          absolute top-1/2 left-1/2
          w-[70%]
          -translate-x-1/2 -translate-y-1/2
          opacity-20 pointer-events-none
        "
      />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="mt-4">
          <p
            className="text-[25px] font-bold text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            SCORE LIST
          </p>
          <p
            className="text-[25px] font-bold text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            FINAL EXAM RESULTS
          </p>
        </div>

        <div className="mt-8">
          <p
            className="text-[22px] font-semibold text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            Level : .............{certificate.beltLevel || ""}.............
          </p>

          <p
            className="text-[22px] font-semibold mt-2 pr-[10%] text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            Student Name : -
          </p>
        </div>

        <div className="mt-6 mb-8">
          <table className="w-full border border-black text-[14px]">
            <thead className="border border-black">
              <tr className="border border-black">
                <th className="border border-black py-1 w-[10%] text-gray-600">
                  <strong>No.</strong>
                </th>
                <th className="border border-black py-1 w-[40%] text-gray-600">
                  <strong>EXAM MATERIALS</strong>
                </th>
                <th className="border border-black py-1 text-gray-600">
                  <strong>Points</strong>
                </th>
                <th className="border border-black py-1 text-gray-600">
                  <strong>Grade</strong>
                </th>
                <th className="border border-black py-1 w-[25%] text-gray-600">
                  <strong>Description</strong>
                </th>
              </tr>
            </thead>

            <tbody>
              {points.map((point, index) => {
                const grade = getLetterGrade(point.point);
                const description = getDescription(grade);

                return (
                  <tr
                    key={point.id}
                    className="border border-black text-center"
                  >
                    <td className="border border-black py-1 text-gray-600">
                      {index + 1}
                    </td>
                    <td className="border border-black py-1 text-gray-600">
                      {point.title}
                    </td>
                    <td className="border border-black py-1 text-gray-600">
                      {point.point}
                    </td>
                    <td className="border border-black py-1 text-gray-600">
                      {grade}
                    </td>
                    <td className="border border-black py-1 text-gray-600">
                      {description}
                    </td>
                  </tr>
                );
              })}

              <tr className="border border-black">
                <td
                  colSpan={2}
                  className="border border-black py-1 text-gray-600"
                >
                  <strong>Total:</strong>
                </td>

                <td className="border border-black py-1 text-gray-600">
                  <strong>{totalScore}</strong>
                </td>

                <td
                  colSpan={2}
                  className="border border-black py-1 text-gray-600"
                >
                  <strong>{overallPerformance}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end pt-4 pr-10">
            <p className="text-[28px] font-bold text-gray-600">
              {Math.round((totalScore / 500) * 100)}%
            </p>
          </div>

          <div className="flex justify-end">
            <div className="border-b-[3px] border-black w-[25%] mr-[10%]" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p
              className="text-[20px] text-gray-600"
              style={{ fontFamily: "PTBOLD" }}
            >
              Regional Official <strong>Cairo</strong>
            </p>
            <p
              className="text-[20px] text-gray-600"
              style={{ fontFamily: "PTBOLD" }}
            >
              Indonesian Martial Arts College
            </p>
            <p
              className="text-[20px] font-bold text-gray-600"
              style={{ fontFamily: "PTBOLD" }}
            >
              Egyptian Committee of Pencak Silat
            </p>
          </div>

          <p
            className="text-[20px] text-gray-600"
            style={{ fontFamily: "PTBOLD" }}
          >
            Chairmen of the Coaching Council
          </p>

          <div className="flex justify-around text-center gap-2 text-gray-600">
            {[
              {
                name: "Ahmed Hany Hamdy",
                title: "Pencak Silat Expert IIII Dan",
              },
              {
                name: "Mohamed Fawzy Imam",
                title: "Pencak Silat Expert IIII Dan",
              },
              {
                name: "Mennatullah Mahmoud",
                title: "Pencak Silat Expert IIII Dan",
              },
              {
                name: "Mazen aldaher",
                title: "Pencak Silat Expert IIII Dan",
              },
            ].map((coach, index) => (
              <div key={index}>
                <p
                  className="text-[14px] font-bold"
                  style={{ fontFamily: "PTBOLD" }}
                >
                  {coach.name}
                </p>
                <div className="border-b border-black my-1" />
                <p className="text-[12px] font-bold">{coach.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCertificateBack;
