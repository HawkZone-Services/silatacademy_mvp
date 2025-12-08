import asyncHandler from "express-async-handler";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Module from "../models/Module.js";
import Program from "../models/Program.js";
import Exam from "../models/Exam.js";
import { httpError } from "../utils/validation.js";
import PDFDocument from "pdfkit";

const issue = async ({
  userId,
  type,
  title,
  description,
  issuedBy,
  examId,
  lessonId,
  moduleId,
  programId,
  meta = {},
}) => {
  return await Certificate.create({
    user: userId,
    type,
    title,
    description,
    issuedBy,
    examId,
    lessonId,
    moduleId,
    programId,
    meta,
    issuedAt: new Date(),
  });
};
const populateCertificate = async (certId) => {
  return await Certificate.findById(certId)
    .populate("user", "name email gender")
    .populate("examId", "title beltLevel")
    .populate("lessonId", "title")
    .populate("moduleId", "title")
    .populate("programId", "title")
    .lean();
};
export const issueLessonCertificate = asyncHandler(async (req, res) => {
  const { lessonId, studentId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "lesson",
    title: `Lesson Completion: ${lesson.title}`,
    description: "Successfully completed lesson requirements",
    lessonId,
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const issueModuleCertificate = asyncHandler(async (req, res) => {
  const { moduleId, studentId } = req.params;

  const module = await Module.findById(moduleId);
  if (!module) throw httpError(404, "Module not found");

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "module",
    title: `Module Certificate: ${module.title}`,
    description: "Completed all module lessons",
    moduleId,
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const issueProgramCertificate = asyncHandler(async (req, res) => {
  const { programId, studentId } = req.params;

  const program = await Program.findById(programId);
  if (!program) throw httpError(404, "Program not found");

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "program",
    title: `${program.title} Certificate`,
    description: "Completed the full training program",
    programId,
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const issuePerformanceCertificate = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "performance",
    title: "Performance Evaluation",
    description: "Admin-issued performance evaluation certificate",
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const issueAttendanceCertificate = asyncHandler(async (req, res) => {
  const { lessonId, studentId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "attendance",
    title: `Attendance Certificate: ${lesson.title}`,
    description: "Attended class successfully",
    lessonId,
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const issueManualCertificate = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "manual",
    title: "Manual Certificate",
    description: "Issued manually by admin",
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const issueExamCertificate = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) throw httpError(404, "Exam not found");

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "exam",
    title: `${exam.title} - Official Exam Certificate`,
    description: "Successfully passed official exam requirements",
    examId,
  });

  const populated = await populateCertificate(cert._id);

  res.json({ success: true, data: { certificate: populated } });
});

export const overrideExamCertificate = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) throw httpError(404, "Exam not found");

  const cert = await issue({
    userId: studentId,
    issuedBy: req.user._id,
    type: "manual",
    title: `${exam.title} - Certificate (Override)`,
    description: "Issued manually by admin regardless of exam status",
    examId,
    meta: { override: true },
  });

  res.json({ success: true, data: { certificate: cert } });
});

export const getMyCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data: { certificates: certs } });
});

export const adminListCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find()
    .populate("user", "name email")
    .populate("examId", "title")
    .populate("lessonId", "title")
    .populate("moduleId", "title")
    .populate("programId", "title")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { certificates: certs } });
});

export const getCertificateData = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.params;

  const cert = await Certificate.findOne({
    examId,
    user: studentId,
  })
    .populate("user", "name email gender")
    .populate("examId", "title beltLevel")
    .populate("lessonId", "title")
    .populate("moduleId", "title")
    .populate("programId", "title")
    .lean();

  if (!cert) throw httpError(404, "Certificate not found");

  res.json({
    success: true,
    data: {
      certificate: cert,
      meta: {
        serial: cert._id,
        issuedAt: cert.issuedAt,
      },
    },
  });
});

// PDF DOWNLOAD will be deleted later
export const downloadCertificatePdf = asyncHandler(async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const cert = await Certificate.findOne({
      examId,
      user: studentId,
    })
      .populate("user", "name email")
      .populate("examId", "title beltLevel");

    if (!cert) throw httpError(404, "Certificate not found");

    const student = cert.user || (await User.findById(studentId));
    const exam = cert.examId || (await Exam.findById(examId));
    const issueDate = cert.issuedAt || cert.createdAt || new Date();
    const serial = cert._id?.toString();

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res
      .status(200)
      .setHeader("Content-Type", "application/pdf")
      .setHeader(
        "Content-Disposition",
        `attachment; filename=\"certificate-${serial}.pdf\"`
      );

    doc.pipe(res);
    doc.fontSize(20).text("Certificate of Achievement", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Student: ${student?.name || "Student"}`);
    doc.text(`Exam: ${exam?.title || "Exam"}`);
    doc.text(`Belt: ${exam?.beltLevel || cert.meta?.beltLevel || "N/A"}`);
    doc.text(`Issued: ${new Date(issueDate).toLocaleDateString()}`);
    doc.text(`Certificate ID: ${serial}`);
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        "This certifies that the student has successfully completed the assessment requirements.",
        { align: "left" }
      );
    doc.end();
  } catch (err) {
    console.error("Certificate PDF error:", err);
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      error: {
        message: err.message || "Failed to generate certificate PDF",
        code: err.code || status,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }
});
