import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

// ==========================================
// CREATE CERTIFICATE (Native MongoDB Version)
// ==========================================
export const createCertificate = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { studentId, examId, finalScore, scores, pdfUrl, passed } = req.body;

  if (!studentId || !examId || !scores) {
    return res.status(400).json({
      success: false,
      message: "studentId, examId, and scores are required",
    });
  }

  // -------------------------------
  // 1) Insert Certificate Document
  // -------------------------------
  const certificate = {
    student: new ObjectId(studentId),
    exam: new ObjectId(examId),
    finalScore,
    scores,
    passed,
    pdfUrl: pdfUrl || null,
    createdAt: new Date(),
  };

  const insertCert = await db.collection("certificates").insertOne(certificate);
  const certId = insertCert.insertedId;

  // -------------------------------
  // 2) Append exam result to player history (Quarterly exams)
  // -------------------------------
  const examHistoryRecord = {
    examId: new ObjectId(examId),
    date: new Date(),
    theoryScore: scores?.theory || 0,

    practicalScores: {
      morality: scores?.morality || 0,
      practicalMethod: scores?.practicalMethod || 0,
      technique: scores?.technique || 0,
      physical: scores?.physical || 0,
      mental: scores?.mental || 0,
    },

    totalScore: finalScore || 0,
    passed: passed || false,
    certificateUrl: pdfUrl || "",
  };

  await db
    .collection("playerProfiles")
    .updateOne(
      { user: new ObjectId(studentId) },
      { $push: { exams: examHistoryRecord } }
    );

  // -------------------------------
  // 3) Return result
  // -------------------------------
  res.json({
    success: true,
    message: "Certificate created and exam history updated",
    certificateId: certId,
  });
});
