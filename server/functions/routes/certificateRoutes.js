import express from "express";
import {
  generateCertificate,
  getMyCertificates,
  checkCertificateExists,
  generateCertificatePDF,
} from "../controllers/certificateController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* STUDENT */
router.get("/my", protect, checkRole("student"), getMyCertificates);
router.get(
  "/pdf/:examId/:studentId",
  protect,
  checkRole("student", "admin", "instructor"),
  generateCertificatePDF
);

/* COACH/INSTRUCTOR */
router.get(
  "/check/:examId/:studentId",
  protect,
  checkRole("admin", "instructor"),
  checkCertificateExists
);

/* ADMIN / INSTRUCTOR */
router.post(
  "/generate",
  protect,
  checkRole("admin", "instructor"),
  generateCertificate
);
router.get(
  "/admin/pdf/:examId/:studentId",
  protect,
  checkRole("admin", "instructor"),
  generateCertificatePDF
);

export default router;
