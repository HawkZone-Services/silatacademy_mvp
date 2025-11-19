import express from "express";
import { protect, checkRole } from "../middlewares/authMiddleware.js";
import {
  generateCertificate,
  getMyCertificates,
} from "../controllers/certificateController.js";

const router = express.Router();

// الطالب يشوف شهاداته
router.get("/my", protect, getMyCertificates);

// المشرف يصدر شهادة لطالب معيّن (بعد Final Pass)
router.post(
  "/admin/generate",
  protect,
  checkRole("admin", "instructor"),
  generateCertificate
);

export default router;
