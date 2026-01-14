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
  trackLessonStep,
} from "../controllers/lessonController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

/* =======================
   STUDENT LESSON ROUTES
======================= */

// 1️⃣ MUST COME FIRST — static route
router.get(
  "/student/available",
  protect,
  checkRole("student"),
  getStudentAvailableLessons
);

// 2️⃣ static
router.get(
  "/student/progress",
  protect,
  checkRole("student"),
  getStudentLessonProgress
);

// ✅ SAVE LESSON PROGRESS (student)
router.post(
  "/student/:lessonId/progress",
  protect,
  checkRole("student"),
  saveProgress
);

//Lesson Steps API
router.post(
  "/student/:lessonId/step",
  protect,
  checkRole("student"),
  trackLessonStep
);

// 3️⃣ static for quiz
router.get(
  "/student/:lessonId/quiz",
  protect,
  checkRole("student"),
  getLessonQuiz
);

// 4️⃣ static submit route
router.post(
  "/student/:lessonId/quiz/submit",
  protect,
  checkRole("student"),
  submitLessonQuiz
);

// 5️⃣ static route for completing lesson
router.post(
  "/student/:lessonId/complete",
  protect,
  checkRole("student"),
  completeStudentLesson
);

// 6️⃣ LAST → dynamic catch route
router.get("/student/:lessonId", protect, checkRole("student"), getLesson);

/* =======================
   ADMIN LESSON CRUD
======================= */

router.get("/", listLessons);

router.post(
  "/",
  protect,
  checkRole("admin"),
  validate([check("title").notEmpty().withMessage("title is required")]),
  createLesson
);

router.get(
  "/:id",
  protect,
  checkRole("admin", "instructor"), // فقط أدمن ومدرب يعرضوا التفاصيل
  getLesson
);

router.patch(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("title").optional().isString()]),
  updateLesson
);

router.delete("/:id", protect, checkRole("admin"), deleteLesson);

export default router;
