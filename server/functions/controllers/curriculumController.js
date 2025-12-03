import asyncHandler from "express-async-handler";
import Lesson from "../models/Lesson.js";
import Program from "../models/Program.js";
import { generateCurriculumPdf } from "../services/pdfService.js";

const beltToProgramLevel = (belt) => {
  if (["white", "yellow"].includes(belt)) return "beginner";
  if (["blue", "brown"].includes(belt)) return "intermediate";
  if (["red", "black"].includes(belt)) return "advanced";
  return null;
};

export const downloadCurriculum = asyncHandler(async (req, res) => {
  const belt = req.params.belt.toLowerCase();
  const level = beltToProgramLevel(belt);

  if (!level) {
    return res.status(400).json({ success: false, message: "Invalid belt" });
  }

  // Fetch lessons with program populated
  const lessons = await Lesson.find()
    .populate("program", "level title")
    .select(
      "title summary technicalContent medicalContent psychologyContent content durationMinutes resources program order createdAt"
    )
    .lean();

  // Filter for specific program level
  const filteredLessons = lessons
    .filter((l) => l.program?.level === level)
    .sort((a, b) => a.order - b.order); // SORT BY ORDER

  // Prepare PDF response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="curriculum-${belt}.pdf"`
  );

  // Generate the PDF with new fields
  const doc = generateCurriculumPdf({
    beltLabel: belt.toUpperCase(),
    lessons: filteredLessons.map((lesson) => ({
      title: lesson.title,
      summary: lesson.summary,
      technicalContent: lesson.technicalContent,
      medicalContent: lesson.medicalContent,
      psychologyContent: lesson.psychologyContent,
      content: lesson.content,
      resources: lesson.resources,
      durationMinutes: lesson.durationMinutes,
      order: lesson.order,
      programTitle: lesson.program?.title,
    })),
  });

  doc.pipe(res);
  doc.end();
});
