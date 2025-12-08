import express from "express";
import { check } from "express-validator";

import {
  listExams,
  getExamsByBeltLevel,
  getExam,
  ExamRegisteration,
  startAttempt,
  submitAttempt,
  getRegistrationStatus,
  getMyAttempts,
} from "../../controllers/examController.js";

import { protect, checkRole } from "../../middlewares/authMiddleware.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

// Student + Admin can list/view exams, but actions restricted
router.use(protect, checkRole("student", "admin"));

/* ================================
   PUBLIC (Student/Admin)
================================ */

// Get all exams with eligibility
router.get("/", listExams);

// Get exams for a belt level
router.get("/available/:beltLevel", checkRole("student"), getExamsByBeltLevel);

// Get my attempts
router.get("/my-attempts", checkRole("student"), getMyAttempts);

// Get single exam
router.get("/:id", getExam);

/* ================================
   STUDENT ACTIONS
================================ */

// Register for exam
router.post(
  "/register",
  checkRole("student"),
  validate([check("examId").notEmpty().withMessage("examId is required")]),
  ExamRegisteration
);

// Start an attempt
router.post(
  "/attempt/start",
  checkRole("student"),
  validate([check("examId").notEmpty().withMessage("examId is required")]),
  startAttempt
);

// Submit attempt (theory)
router.post(
  "/attempt/submit",
  checkRole("student"),
  validate([
    check("attemptId").notEmpty().withMessage("attemptId is required"),
    check("answers").isArray({ min: 1 }).withMessage("answers array required"),
  ]),
  submitAttempt
);

// Registration status
router.get(
  "/registration/status/:examId",
  checkRole("student"),
  getRegistrationStatus
);

export default router;
