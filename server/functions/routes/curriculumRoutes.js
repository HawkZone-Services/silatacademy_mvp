import express from "express";
import { downloadCurriculum } from "../controllers/curriculumController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/:belt/pdf",
  protect,
  checkRole("admin", "instructor"),
  downloadCurriculum
);

export default router;
