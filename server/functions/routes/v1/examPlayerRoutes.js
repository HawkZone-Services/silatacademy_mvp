import express from "express";
import { check } from "express-validator";

import {
  listExams,
  getExam,
  getExamsByBeltLevel,
  ExamRegisteration,
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getRegistrationStatus,
} from "../../controllers/examController.js";

import { protect, checkRole } from "../../middlewares/authMiddleware.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

// 👨‍🎓 student only
router.use(protect, checkRole("student", "admin", "instructor"));

/* ================================
   EXAMS (with eligibility)
================================ */

// list exams (with eligibility attached)
router.get("/", listExams);

// list by belt
router.get("/belt/:beltLevel", getExamsByBeltLevel);

// single exam (published only)
router.get("/:id", getExam);

/* ================================
   REGISTRATION
================================ */

router.post(
  "/register",
  validate([check("examId").notEmpty()]),
  ExamRegisteration
);

// get my registration status for exam
router.get("/registration/:examId", getRegistrationStatus);

/* ================================
   ATTEMPTS (THEORY)
================================ */

// start theory (requires approved registration)
router.post(
  "/attempt/start",
  validate([check("examId").notEmpty()]),
  startAttempt
);

// submit theory
router.post(
  "/attempt/submit",
  validate([check("attemptId").notEmpty()]),
  submitAttempt
);

// my attempts + results
router.get("/attempts/me", getMyAttempts);

export default router;
