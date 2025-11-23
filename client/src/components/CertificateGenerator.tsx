import React, { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

import heroSilat from "@/assets/hero-silat.jpg"; // placeholder
import patternBg from "@/assets/pattern-bg.jpg"; // watermark / belt fallback

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

type CertificateItem = {
  _id: string;
  beltLevel?: string;
  exam?: { _id?: string; title?: string; beltLevel?: string };
  student?: {
    _id?: string;
    name?: string;
    name_en?: string;
    avatarUrl?: string;
  };
};

type FinalResult = {
  exam?: {
    _id?: string;
    title?: string;
    beltLevel?: string;
    maxTheoryScore?: number;
  };
  theoryScore?: number;
  practicalScores?: {
    morality?: number;
    practicalMethod?: number;
    technique?: number;
    physical?: number;
    mental?: number;
  };
  totalScore?: number;
  passed?: boolean;
};

type StudentOption = {
  id: string;
  name: string;
  name_en?: string;
  avatar?: string;
  levels: LevelOption[];
};

type LevelOption = {
  id: number;
  examId?: string;
  beltLevel?: string;
  levelTitle?: string;
  level?: string;
  beltDate?: string;
  beltPlace?: string;
  approveDate?: string;
  beltArt?: string;
  points: { id: number; title: string; point: number }[];
};

const beltArtFallback = patternBg;
const beltArtByLevel: Record<string, string> = {
  white: beltArtFallback,
  yellow: beltArtFallback,
  blue: beltArtFallback,
  brown: beltArtFallback,
  red: beltArtFallback,
  black: beltArtFallback,
};

const placeholderAvatar = heroSilat;

const CardShell: React.FC<
  React.PropsWithChildren<{ innerRef: React.RefObject<HTMLDivElement> }>
> = ({ children, innerRef }) => (
  <div
    ref={innerRef}
    className="relative overflow-hidden text-center"
    style={{
      width: "210mm",
      height: "297mm",
      padding: "10px 20px",
      backgroundColor: "#fbf8cc",
    }}
  >
    {children}
  </div>
);

const Watermark = ({ src = patternBg, opacity = 0.2 }) => (
  <img
    src={src}
    alt="Watermark"
    className="pointer-events-none"
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      opacity,
      zIndex: 0,
      width: "80%",
      height: "auto",
    }}
  />
);

const CertFront = ({
  frontRef,
  item,
  level,
}: {
  frontRef: React.RefObject<HTMLDivElement>;
  item: StudentOption;
  level: LevelOption;
}) => (
  <CardShell innerRef={frontRef}>
    <Watermark />
    <div className="relative z-10 h-full flex flex-col">
      <div className="pt-1 text-left">
        <p className="text-[18px]">No. {item?.id || item?.name}</p>
      </div>

      <div className="flex justify-center gap-2 pt-2">
        {[heroSilat, heroSilat, heroSilat].map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt="logo"
            className="rounded-full"
            style={{
              width: idx === 1 ? "90px" : "80px",
              height: idx === 1 ? "90px" : "80px",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mt-[-1%] mb-[-13%] flex justify-center">
        <img
          src={
            level?.beltArt ||
            beltArtByLevel[level?.beltLevel || ""] ||
            beltArtFallback
          }
          alt="belt"
          className="w-full h-full"
          style={{ transform: "scale(0.9)" }}
        />
      </div>

      <div className="space-y-1">
        <p className="text-[30px] font-semibold">شهادة إجتياز حزام</p>
        <p className="text-[35px] font-semibold text-[darkblue] my-[-4px]">
          جمهورية مصر العربية
        </p>
        <p className="text-[35px] font-semibold text-[darkRed]">
          اللجنة العليا للبنجاك سيلات
        </p>
      </div>

      <div className="w-full pt-2">
        <p className="text-[25px] font-semibold leading-relaxed">
          بناءاً على نتائج الإختبار النهائي لدرجة الحزام {level.levelTitle}{" "}
          والذي أقيم
          <br /> في {level?.beltPlace || "-"} بتاريخ {level?.beltDate || "-"}{" "}
          للطالب / الطالبة
        </p>
      </div>

      <div className="mb-2">
        <p className="underline text-[55px] font-bold">{item?.name}</p>
      </div>

      <div className="flex justify-between px-3 py-2 text-[20px] font-semibold">
        <span>نادي / هيئة خاصة: {level?.beltDate || "-"}</span>
        <span>تاريخ الميلاد : {item?.bod || item?.dob || "-"}</span>
      </div>

      <p className="text-[22px] font-normal py-1">
        قد إجتاز الإختبار بكفاءة وحصل على درجة المستوى {level?.level || "-"} في
        بنجاك سيلات مصر
      </p>

      <p className="text-[30px] font-semibold">
        الحزام {level?.levelTitle || "-"}
      </p>

      <p className="text-[22px] font-normal py-1">
        (FPSTI) - وقد تم إعتماد حزام المستوى {level?.levelTitle || "-"} من قبل
        الإتحاد الدولي
      </p>

      <div className="flex justify-between mt-2 mb-[-8px] items-center">
        <img
          src={item.avatar || placeholderAvatar}
          alt="student"
          className="h-[180px] w-auto object-cover"
        />
        <p className="text-[20px] font-semibold rtl">
          القاهرة : {level?.approveDate || "-"}
        </p>
      </div>

      <div className="mt-[-8%] flex flex-col gap-4">
        <div className="flex justify-center">
          <p className="text-[23px] font-semibold">رؤساء مجلس التدريب</p>
        </div>
        <div className="flex justify-around gap-6">
          {[
            "أحمد هاني رجب",
            "محمد فوزي إمام",
            "منة الله محمود",
            "مازن الضاهر",
          ].map((name) => (
            <div key={name} className="text-center min-w-[120px]">
              <p>{name}</p>
              <div className="border-b border-black my-1" />
              <p>بندكار</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </CardShell>
);

const CertBack = ({
  backRef,
  level,
  item,
}: {
  backRef: React.RefObject<HTMLDivElement>;
  level: LevelOption;
  item: StudentOption;
}) => {
  const totalScore = level.points.reduce((sum, point) => sum + point.point, 0);
  const overallPerformance =
    totalScore >= 400
      ? "VERY WELL"
      : totalScore >= 300
      ? "WELL"
      : totalScore >= 200
      ? "ENOUGH"
      : "LESS";

  const getLetterGrade = (score: number) => {
    if (score > 80) return "A";
    if (score > 70) return "B";
    if (score > 60) return "C";
    return "D";
  };

  const getPerformanceDescription = (letter: string) => {
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

  return (
    <CardShell innerRef={backRef}>
      <Watermark />
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-col items-center mt-2 space-y-1">
          <p className="text-[25px] font-semibold">SCORE LIST</p>
          <p className="text-[25px] font-semibold">FINAL EXAM RESULTS</p>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-3">
          <p className="text-[22px] font-semibold">
            Level : .............{level.level}.............
          </p>
          <div className="pr-[10%]">
            <p className="text-[22px] font-semibold">
              Student Name : {item.name_en || item.name}
            </p>
          </div>
        </div>

        <div className="mt-4 mb-5">
          <table className="w-full border border-black text-center text-[14px]">
            <thead className="border border-black">
              <tr className="border border-black">
                <th className="w-[10%] border border-black py-1">No.</th>
                <th className="w-[40%] border border-black py-1">
                  EXAM MATERIALS
                </th>
                <th className="border border-black py-1">Points</th>
                <th className="border border-black py-1">Grade</th>
                <th className="w-[25%] border border-black py-1">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {level.points.map((point, index) => {
                const letterGrade = getLetterGrade(point.point);
                return (
                  <tr key={point.id} className="border border-black">
                    <td className="border border-black py-1">{index + 1}</td>
                    <td className="border border-black py-1">{point.title}</td>
                    <td className="border border-black py-1">{point.point}</td>
                    <td className="border border-black py-1">{letterGrade}</td>
                    <td className="border border-black py-1">
                      {getPerformanceDescription(letterGrade)}
                    </td>
                  </tr>
                );
              })}
              <tr className="border border-black font-semibold">
                <td className="border border-black py-1" colSpan={2}>
                  Total:
                </td>
                <td className="border border-black py-1">{totalScore}</td>
                <td className="border border-black py-1" colSpan={2}>
                  {overallPerformance}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end pt-4 pr-6">
            <p className="text-3xl font-semibold">
              {Math.round((totalScore / 500) * 100)}%
            </p>
          </div>
          <div className="mt-1 ml-[75%] border-b-4 border-black" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <p className="text-[20px] font-normal">
              Regional Official <strong>Cairo</strong>
            </p>
            <p className="text-[20px] font-normal">
              Indonesian Martial Arts College
            </p>
            <p className="text-[20px] font-semibold">
              Egyptian Committee of Pencak Silat
            </p>
          </div>

          <div className="flex justify-center pb-5">
            <p className="text-[20px] font-normal">
              Chairmen of the Coaching Council
            </p>
          </div>

          <div className="flex justify-around gap-2">
            {[
              "Ahmed Hany Hamdy",
              "Mohamed Fawzy Imam",
              "Mennatullah Mahmoud",
              "Mazen aldaher",
            ].map((name) => (
              <div key={name} className="text-center min-w-[120px]">
                <p className="text-[14px] font-semibold">{name}</p>
                <div className="border-b border-black my-1" />
                <p className="text-[12px] font-semibold">
                  Pencak Silat Expert IIII Dan
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
};

const CertificateGenerator = () => {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const fetchCertificates = async (): Promise<CertificateItem[]> => {
    const res = await fetch(`${API}/certificates/my`, { headers });
    const data = await res.json();
    return Array.isArray(data.certificates) ? data.certificates : [];
  };

  const fetchResults = async (): Promise<FinalResult[]> => {
    if (!user?._id) return [];
    try {
      const res = await fetch(`${API}/exams/results/${user._id}`, { headers });
      const data = await res.json();
      return Array.isArray(data.results) ? data.results : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [certs, results] = await Promise.all([
          fetchCertificates(),
          fetchResults(),
        ]);
        // results drive levels; certs kept for future use if needed
        const studentLevels: LevelOption[] = results.map((r, idx) => {
          const ps = r.practicalScores || {};
          return {
            id: idx + 1,
            examId: r.exam?._id,
            beltLevel: r.exam?.beltLevel,
            levelTitle: r.exam?.beltLevel || "الحزام",
            level: r.exam?.beltLevel || "",
            beltDate: new Date().toLocaleDateString(),
            beltPlace: "Silat Academy",
            approveDate: new Date().toLocaleDateString(),
            beltArt: beltArtByLevel[r.exam?.beltLevel || ""] || beltArtFallback,
            points: [
              { id: 1, title: "morality", point: ps.morality || 0 },
              { id: 2, title: "Method", point: ps.practicalMethod || 0 },
              { id: 3, title: "Technique", point: ps.technique || 0 },
              { id: 4, title: "physical", point: ps.physical || 0 },
              { id: 5, title: "mental", point: ps.mental || 0 },
            ],
          };
        });

        const student: StudentOption = {
          id: user?._id || "me",
          name: user?.name || "Student",
          name_en: user?.name,
          avatar: user?.avatarUrl || placeholderAvatar,
          levels: studentLevels,
        };

        setStudents([student]);
        if (studentLevels[0]) {
          setSelectedStudentId(student.id);
          setSelectedLevelId(String(studentLevels[0].id));
        }
      } catch (err) {
        console.error("Certificate generator load failed:", err);
      }
    };

    load();
  }, []);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );
  const selectedLevel = useMemo(
    () => selectedStudent?.levels.find((l) => String(l.id) === selectedLevelId),
    [selectedStudent, selectedLevelId]
  );

  const handleDownloadPDF = async () => {
    if (
      !frontRef.current ||
      !backRef.current ||
      !selectedStudent ||
      !selectedLevel
    )
      return;

    const pdf = new jsPDF("portrait", "mm", "a4");
    const frontCanvas = await html2canvas(frontRef.current, { scale: 3 });
    const frontImgData = frontCanvas.toDataURL("image/png");
    pdf.addImage(frontImgData, "PNG", 0, 0, 210, 297);

    pdf.addPage();
    const backCanvas = await html2canvas(backRef.current, { scale: 3 });
    const backImgData = backCanvas.toDataURL("image/png");
    pdf.addImage(backImgData, "PNG", 0, 0, 210, 297);

    pdf.save(`${selectedStudent?.name}_certificate.pdf`);
  };

  const handleDownloadWord = () => {
    if (!selectedStudent || !selectedLevel) return;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Certificate of Achievement",
                  bold: true,
                  size: 48,
                }),
              ],
            }),
            new Paragraph(
              `This certificate is awarded to ${selectedStudent.name}`
            ),
            new Paragraph(`Level Achieved: ${selectedLevel?.levelTitle}`),
            new Paragraph("For outstanding performance and dedication."),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${selectedStudent?.name}_certificate.docx`);
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Select a Student</label>
          <select
            className="border rounded px-3 py-2 bg-white"
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setSelectedLevelId("");
            }}
          >
            <option value="">Choose...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Select a Belt Level</label>
            <select
              className="border rounded px-3 py-2 bg-white"
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
            >
              <option value="">Choose...</option>
              {selectedStudent.levels.map((level) => (
                <option key={level.id} value={String(level.id)}>
                  {level.levelTitle}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!selectedStudent || !selectedLevel}
            onClick={handleDownloadPDF}
          >
            Save as PDF
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
            disabled={!selectedStudent || !selectedLevel}
            onClick={handleDownloadWord}
          >
            شهادة
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedStudent && selectedLevel && (
            <>
              <CertFront
                frontRef={frontRef}
                item={selectedStudent}
                level={selectedLevel}
              />
              <CertBack
                backRef={backRef}
                item={selectedStudent}
                level={selectedLevel}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
export { CertificateGenerator };
