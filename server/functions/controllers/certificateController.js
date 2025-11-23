import asyncHandler from "express-async-handler";
import PDFDocument from "pdfkit";
import { getDb } from "../utils/mongodb.js";
import { assertObjectId, httpError, asNumber } from "../utils/validation.js";

const buildCertificateProjection = () => ({
  _id: 1,
  beltLevel: 1,
  pdfUrl: 1,
  passed: 1,
  totalScore: {
    $ifNull: ["$totalScore", { $ifNull: ["$scores.total", 0] }],
  },
  issuedAt: { $ifNull: ["$issuedAt", "$createdAt"] },
  exam: {
    _id: "$examDoc._id",
    title: "$examDoc.title",
    beltLevel: "$examDoc.beltLevel",
    maxTheoryScore: "$examDoc.maxTheoryScore",
  },
  student: {
    _id: "$student._id",
    name: "$student.name",
    email: "$student.email",
    beltLevel: "$student.beltLevel",
  },
});

const mapScoresFromFinal = (finalResult) => ({
  morality: asNumber(finalResult?.practicalScores?.morality),
  method: asNumber(finalResult?.methodTotal),
  technique: asNumber(finalResult?.practicalScores?.technique),
  physical: asNumber(finalResult?.practicalScores?.physical),
  mental: asNumber(finalResult?.practicalScores?.mental),
  total: asNumber(finalResult?.totalScore),
});

const fetchFinalResult = async (db, examId, studentId) => {
  const [finalResult] = await db
    .collection("finalExamResults")
    .find({ exam: examId, student: studentId })
    .sort({ finalizedAt: -1, date: -1, _id: -1 })
    .limit(1)
    .toArray();

  return finalResult || null;
};

/* =====================================================
   ADMIN: CREATE CERTIFICATE (AFTER FINAL RESULT)
===================================================== */
export const generateCertificate = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  const [finalResult, exam, student] = await Promise.all([
    fetchFinalResult(db, examId, studentId),
    db.collection("exams").findOne({ _id: examId }),
    db.collection("users").findOne(
      { _id: studentId },
      { projection: { password: 0 } }
    ),
  ]);

  if (!exam) throw httpError(404, "Exam not found");
  if (!student) throw httpError(404, "Student not found");
  if (!finalResult) {
    throw httpError(
      400,
      "Finalize the exam result before generating a certificate."
    );
  }

  const scores = mapScoresFromFinal(finalResult);

  const certificateResult = await db.collection("certificates").findOneAndUpdate(
    { exam: examId, student: studentId },
    {
      $set: {
        updatedAt: new Date(),
      },
      $setOnInsert: {
        exam: examId,
        student: studentId,
        scores,
        totalScore: scores.total,
        passed: Boolean(finalResult.passed),
        beltLevel: exam.beltLevel || student.beltLevel || "white",
        pdfUrl: null,
        issuedAt: new Date(),
        createdAt: new Date(),
        metadata: {
          examTitle: exam.title,
          studentName: student.name,
        },
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const created = !certificateResult.lastErrorObject?.updatedExisting;

  res.status(created ? 201 : 200).json({
    success: true,
    created,
    certificate: certificateResult.value,
  });
});

/* =====================================================
   COACH/ADMIN: CHECK CERTIFICATE EXISTS
===================================================== */
export const checkCertificateExists = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.examId, "examId");
  const studentId = assertObjectId(req.params.studentId, "studentId");

  const cert = await db.collection("certificates").findOne({
    exam: examId,
    student: studentId,
  });

  res.json({
    success: true,
    exists: Boolean(cert),
    certificateId: cert?._id,
  });
});

/* =====================================================
   STUDENT: MY CERTIFICATES
===================================================== */
export const getMyCertificates = asyncHandler(async (req, res) => {
  const db = await getDb();
  const studentId = assertObjectId(req.user._id, "studentId");

  const certificates = await db
    .collection("certificates")
    .aggregate([
      { $match: { student: studentId } },
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examDoc",
        },
      },
      { $unwind: { path: "$examDoc", preserveNullAndEmptyArrays: true } },
      { $project: buildCertificateProjection() },
      { $sort: { issuedAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, certificates });
});

/* =====================================================
   GENERATE/DOWNLOAD CERTIFICATE PDF
===================================================== */
export const generateCertificatePDF = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.examId, "examId");
  const studentId = assertObjectId(req.params.studentId, "studentId");

  if (
    req.user?.role === "student" &&
    req.user._id?.toString() !== studentId.toString()
  ) {
    throw httpError(403, "You can only access your own certificates.");
  }

  const [certificate] = await db
    .collection("certificates")
    .aggregate([
      { $match: { exam: examId, student: studentId } },
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
    ])
    .toArray();

  if (!certificate) {
    throw httpError(404, "Certificate not found");
  }

  const studentName = certificate.student?.name || "Student";
  const examTitle = certificate.exam?.title || "Exam";
  const beltLevel =
    certificate.beltLevel || certificate.exam?.beltLevel || "N/A";
  const totalScore =
    certificate.totalScore ??
    certificate.scores?.total ??
    certificate.scores?.method ??
    0;
  const issuedAt = certificate.issuedAt || certificate.createdAt || new Date();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="certificate-${studentName}.pdf"`
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  doc.fontSize(22).text("Silat Academy", { align: "center" }).moveDown(0.5);
  doc.fontSize(18).text("Certificate of Achievement", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(12).text(`Awarded to: ${studentName}`);
  doc.moveDown(0.5);
  doc.text(`Exam: ${examTitle}`);
  doc.text(`Belt Level: ${beltLevel}`);
  doc.text(`Total Score: ${totalScore}`);
  doc.text(`Issued On: ${new Date(issuedAt).toDateString()}`);
  doc.moveDown(1);
  doc.text(
    "Congratulations on successfully completing the Silat assessment. Keep training and improving!",
    { align: "left" }
  );

  doc.end();
});
