import express from "express";
import {
  listExams,
  getExam,
  createExam,
  updateExam,
  startAttempt,
  submitAttempt,
  publishExam,
  getExamsByBeltLevel,
  ExamRegisteration,
  approveRegistration,
  rejectRegistration,
  gradeManual2,
  combineScores,
  listSubmissions,
  gradeManual,
  getMyAttempts,
} from "../controllers/examController.js";

import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================================================
   STUDENT EXAM ROUTES  (Safe for students)
================================================ */

router.get("/", protect, listExams);
router.get("/available/:beltLevel", protect, getExamsByBeltLevel);
router.get("/my-attempts", protect, getMyAttempts);
router.get("/:id", protect, getExam);

router.post("/register", protect, ExamRegisteration);

router.post("/attempt/start", protect, startAttempt);
router.post("/attempt/submit", protect, submitAttempt);

/* ================================================
   ADMIN EXAM ROUTES (Restricted)
================================================ */

// Approve registration
router.patch(
  "/admin/registration/:id/approve",
  protect,
  checkRole("admin", "instructor"),
  approveRegistration
);

// Reject registration
router.patch(
  "/admin/registration/:id/reject",
  protect,
  checkRole("admin", "instructor"),
  rejectRegistration
);

// Create exam
router.post("/admin", protect, checkRole("admin", "instructor"), createExam);

// Publish exam
router.patch(
  "/admin/:examId/publish",
  protect,
  checkRole("admin", "instructor"),
  publishExam
);

// Update exam
router.patch(
  "/admin/:id",
  protect,
  checkRole("admin", "instructor"),
  updateExam
);

// View submissions for specific exam
router.get(
  "/admin/submissions/:examId",
  protect,
  checkRole("admin", "instructor"),
  listSubmissions
);

// Save practical score
router.post(
  "/admin/practical/score",
  protect,
  checkRole("admin", "instructor"),
  gradeManual2
);

// Combine scores for final evaluation
router.post(
  "/admin/finalize",
  protect,
  checkRole("admin", "instructor"),
  combineScores
);

// Manual grading (essay)
router.post(
  "/admin/:id/grade",
  protect,
  checkRole("admin", "instructor"),
  gradeManual
);

export default router;
