import express from "express";
import { protect, checkRole } from "../middlewares/authMiddleware.js";
import { check } from "express-validator";
import { validate } from "../middlewares/validate.js";
import {
  issueLessonCertificate,
  issueModuleCertificate,
  issueProgramCertificate,
  issuePerformanceCertificate,
  issueAttendanceCertificate,
  issueManualCertificate,
  issueExamCertificate,
  overrideExamCertificate,
  getMyCertificates,
  adminListCertificates,
  getCertificateData,
} from "../controllers/certificateController.js";

const router = express.Router();

// Student route
router.get("/my", protect, getMyCertificates);

// Admin-only issuance
router.post(
  "/lesson/:lessonId/:studentId",
  protect,
  checkRole("admin"),
  validate([check("lessonId").isMongoId(), check("studentId").isMongoId()]),
  issueLessonCertificate
);
router.post(
  "/module/:moduleId/:studentId",
  protect,
  checkRole("admin"),
  validate([check("moduleId").isMongoId(), check("studentId").isMongoId()]),
  issueModuleCertificate
);
router.post(
  "/program/:programId/:studentId",
  protect,
  checkRole("admin"),
  validate([check("programId").isMongoId(), check("studentId").isMongoId()]),
  issueProgramCertificate
);

router.post(
  "/performance/:studentId",
  protect,
  checkRole("admin"),
  validate([check("studentId").isMongoId()]),
  issuePerformanceCertificate
);
router.post(
  "/attendance/:lessonId/:studentId",
  protect,
  checkRole("admin"),
  validate([check("lessonId").isMongoId(), check("studentId").isMongoId()]),
  issueAttendanceCertificate
);
router.post(
  "/manual/:studentId",
  protect,
  checkRole("admin"),
  validate([check("studentId").isMongoId()]),
  issueManualCertificate
);

// Exam official issuance
router.post(
  "/exam/:examId/:studentId",
  protect,
  checkRole("admin"),
  validate([check("examId").isMongoId(), check("studentId").isMongoId()]),
  issueExamCertificate
);
router.post(
  "/exam/override/:examId/:studentId",
  protect,
  checkRole("admin"),
  validate([check("examId").isMongoId(), check("studentId").isMongoId()]),
  overrideExamCertificate
);

// Admin list
router.get("/admin/all", protect, checkRole("admin"), adminListCertificates);
router.get(
  "/data/:examId/:studentId",
  protect,
  validate([check("examId").isMongoId(), check("studentId").isMongoId()]),
  getCertificateData
);

export default router;
