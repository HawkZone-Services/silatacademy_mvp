import express from "express";
import {
  createLesson,
  getLesson,
  listLessons,
  saveProgress,
  updateLesson,
} from "../controllers/lessonController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listLessons);

router.get(
  "/:id",
  protect,
  checkRole("student", "admin", "instructor"),
  getLesson
);

router.post("/", protect, checkRole("admin", "instructor"), createLesson);

router.patch("/:id", protect, checkRole("admin", "instructor"), updateLesson);

router.post(
  "/:id/progress",
  protect,
  checkRole("student", "admin", "instructor"),
  saveProgress
);

export default router;
