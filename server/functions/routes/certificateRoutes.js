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
router.get("/my", protect, checkRole("player"), getMyCertificates);
router.get(
  "/pdf/:examId/:studentId",
  protect,
  checkRole("player"),
  generateCertificatePDF
);

/* COACH */
router.get(
  "/check/:examId/:studentId",
  protect,
  checkRole("coach"),
  checkCertificateExists
);

/* ADMIN */
router.post("/generate", protect, checkRole("admin"), generateCertificate);
router.get(
  "/admin/pdf/:examId/:studentId",
  protect,
  checkRole("admin"),
  generateCertificatePDF
);

export default router;
