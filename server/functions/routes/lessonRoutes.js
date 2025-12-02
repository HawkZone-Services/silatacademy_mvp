import express from "express";
import { check } from "express-validator";
import {
  createLesson,
  getLesson,
  listLessons,
  saveProgress,
  updateLesson,
  deleteLesson,
  getStudentAvailableLessons,
  getStudentLessonProgress,
  completeStudentLesson,
  getLessonQuiz,
  submitLessonQuiz,
} from "../controllers/lessonController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

/* =======================
   ADMIN LESSON CRUD
======================= */

router.get("/", protect, checkRole("admin"), listLessons);
router.post(
  "/",
  protect,
  checkRole("admin"),
  validate([check("title").notEmpty().withMessage("title is required")]),
  createLesson
);
router.get("/:id", protect, checkRole("admin"), getLesson);
router.patch(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("title").optional().isString()]),
  updateLesson
);
router.delete("/:id", protect, checkRole("admin"), deleteLesson);

router.get(
  "/:lessonId/quiz",
  protect,
  checkRole("student"),
  getLessonQuiz
);
router.post(
  "/:lessonId/quiz/submit",
  protect,
  checkRole("student"),
  submitLessonQuiz
);
router.post(
  "/:id/progress",
  protect,
  checkRole("student", "admin", "instructor"),
  saveProgress
);
/* =======================
   STUDENT LESSON APIS
======================= */
// 🔹 دروس الطالب المتاحة (مع locks + attendance)
router.get(
  "/student/available",
  protect,
  checkRole("student"),
  getStudentAvailableLessons
);

// 🔹 ملخص progress على مستوى البرامج/الكلي
router.get(
  "/student/progress",
  protect,
  checkRole("student"),
  getStudentLessonProgress
);

// 🔹 إنهاء الدرس + تسجيل نتيجة الكويز
router.post(
  "/student/:lessonId/complete",
  protect,
  checkRole("student"),
  completeStudentLesson
);
export default router;
