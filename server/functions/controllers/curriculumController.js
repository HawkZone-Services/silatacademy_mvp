import asyncHandler from "express-async-handler";
import { getDb } from "../utils/mongodb.js";
import { generateCurriculumPdf } from "../services/pdfService.js";

const beltToProgramLevel = (belt) => {
  if (["white", "yellow"].includes(belt)) return "beginner";
  if (["blue", "brown"].includes(belt)) return "intermediate";
  if (["red", "black"].includes(belt)) return "advanced";
  return null;
};

export const downloadCurriculum = asyncHandler(async (req, res) => {
  const belt = req.params.belt;
  const level = beltToProgramLevel(belt);
  if (!level) {
    return res.status(400).json({ success: false, message: "Invalid belt" });
  }

  const db = await getDb();
  const lessons = await db
    .collection("lessons")
    .aggregate([
      {
        $lookup: {
          from: "programs",
          localField: "program",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
      { $match: { "program.level": level } },
      {
        $project: {
          title: 1,
          summary: 1,
          technicalContent: 1,
          medicalContent: 1,
          psychologyContent: 1,
        },
      },
      { $sort: { order: 1, createdAt: -1 } },
    ])
    .toArray();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=\"curriculum-${belt}.pdf\"`
  );

  const doc = generateCurriculumPdf({
    beltLabel: belt.toUpperCase(),
    lessons,
  });

  doc.pipe(res);
  doc.end();
});
