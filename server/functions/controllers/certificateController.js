import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

/* =====================================================
   GENERATE CERTIFICATE (ADMIN ONLY)
===================================================== */
export const generateCertificate = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { examId, studentId } = req.body;

  if (!examId || !studentId) {
    return res
      .status(400)
      .json({ success: false, message: "examId and studentId are required" });
  }

  const examObjectId = new ObjectId(examId);
  const studentObjectId = new ObjectId(studentId);

  // 1) تأكد إن في نتيجة نهائية Passed
  const finalResult = await db.collection("finalExamResults").findOne({
    exam: examObjectId,
    student: studentObjectId,
    passed: true,
  });

  if (!finalResult) {
    return res.status(400).json({
      success: false,
      message: "No passed final result found for this exam and student.",
    });
  }

  // 2) احصل على بيانات الامتحان والطالب
  const exam = await db.collection("exams").findOne({ _id: examObjectId });
  const student = await db.collection("players").findOne({
    _id: studentObjectId,
  });

  if (!exam || !student) {
    return res.status(404).json({
      success: false,
      message: "Exam or student not found",
    });
  }

  // 3) توليد رقم شهادة (بسيط لمرة أولى)
  const certNumber = `SILAT-${exam.beltLevel?.toUpperCase() || "BELT"}-${
    student.national_id || student._id.toString().slice(-6)
  }-${Date.now()}`;

  const certificateDoc = {
    exam: examObjectId,
    student: studentObjectId,
    finalResultId: finalResult._id,
    beltLevel: exam.beltLevel,
    examTitle: exam.title,
    studentName: student.name,
    totalScore: finalResult.totalScore,
    issuedBy: new ObjectId(req.user._id),
    issuedAt: new Date(),
    certificateNumber: certNumber,
    // لاحقًا ممكن تضيف pdfUrl
  };

  const insertRes = await db
    .collection("certificates")
    .insertOne(certificateDoc);

  return res.json({
    success: true,
    certificateId: insertRes.insertedId,
    certificate: certificateDoc,
  });
});

/* =====================================================
   GET MY CERTIFICATES (STUDENT)
===================================================== */
export const getMyCertificates = asyncHandler(async (req, res) => {
  const db = await getDb();
  const studentId = new ObjectId(req.user._id);

  const certificates = await db
    .collection("certificates")
    .aggregate([
      { $match: { student: studentId } },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
      { $sort: { issuedAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, certificates });
});
