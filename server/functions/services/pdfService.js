import PDFDocument from "pdfkit";

export const generateCurriculumPdf = ({ beltLabel, lessons = [] }) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.fontSize(20).text(`Silat Curriculum - ${beltLabel} Belt`, { align: "center" });
  doc.moveDown(1);

  lessons.forEach((lesson, idx) => {
    doc
      .fontSize(14)
      .fillColor("#000")
      .text(`${idx + 1}. ${lesson.title || "Lesson"}`, { underline: true });
    if (lesson.summary) {
      doc.fontSize(11).fillColor("#333").text(lesson.summary);
    }
    if (lesson.technicalContent) {
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor("#111").text("Technical:", { continued: false });
      doc.fontSize(11).fillColor("#444").text(lesson.technicalContent);
    }
    if (lesson.medicalContent) {
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor("#111").text("Medical:", { continued: false });
      doc.fontSize(11).fillColor("#444").text(lesson.medicalContent);
    }
    if (lesson.psychologyContent) {
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor("#111").text("Psychology:", { continued: false });
      doc.fontSize(11).fillColor("#444").text(lesson.psychologyContent);
    }
    doc.moveDown(1);
  });

  return doc;
};
