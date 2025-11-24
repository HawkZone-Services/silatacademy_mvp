import express from "express";
import {
  studentReport,
  beltProgression,
  examStatistics,
  lessonCompletionStats,
} from "../controllers/analyticsController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/students",
  protect,
  checkRole("admin", "instructor"),
  studentReport
);
router.get(
  "/belt",
  protect,
  checkRole("admin", "instructor"),
  beltProgression
);
router.get(
  "/exams",
  protect,
  checkRole("admin", "instructor"),
  examStatistics
);
router.get(
  "/lessons",
  protect,
  checkRole("admin", "instructor"),
  lessonCompletionStats
);

export default router;
