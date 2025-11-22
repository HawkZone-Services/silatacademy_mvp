import express from "express";
import {
  generateCertificate,
  checkCertificateExists,
  getMyCertificates,
  generateCertificatePDF,
} from "../controllers/certificateController.js";

import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =====================================================
   STUDENT ROUTES
===================================================== */

// 1) الطالب يجيب شهاداته
router.get("/my", protect, checkRole("player"), getMyCertificates);

// 2) الطالب يفتح الشهادة PDF
router.get(
  "/pdf/:examId/:studentId",
  protect,
  checkRole("player"),
  generateCertificatePDF
);

/* =====================================================
   COACH ROUTES
===================================================== */

// 3) المدرب يتحقق هل الشهادة موجودة
router.get(
  "/check/:examId/:studentId",
  protect,
  checkRole("coach"),
  checkCertificateExists
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

// 4) الأدمن ينشئ الشهادة بعد Finalize
router.post("/generate", protect, checkRole("admin"), generateCertificate);

// 5) الأدمن يفتح أي شهادة PDF
router.get(
  "/admin/pdf/:examId/:studentId",
  protect,
  checkRole("admin"),
  generateCertificatePDF
);

export default router;
