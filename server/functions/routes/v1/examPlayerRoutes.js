import express from "express";
import { check } from "express-validator";
import {
  listExams,
  getExamsByBeltLevel,
  getMyAttempts,
  getExam,
  ExamRegisteration,
  startAttempt,
  submitAttempt,
  getRegistrationStatus,
} from "../../controllers/examController.js";
import { protect, checkRole } from "../../middlewares/authMiddleware.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

router.use(protect, checkRole("student", "admin"));

router.get("/", listExams);
router.get("/available/:beltLevel", checkRole("student"), getExamsByBeltLevel);
router.get("/my-attempts", checkRole("student"), getMyAttempts);
router.get("/:id", getExam);
router.post(
  "/register",
  checkRole("student"),
  validate([check("examId").notEmpty().withMessage("examId is required")]),
  ExamRegisteration
);
router.post(
  "/attempt/start",
  checkRole("student"),
  validate([check("examId").notEmpty().withMessage("examId is required")]),
  startAttempt
);
router.post(
  "/attempt/submit",
  checkRole("student"),
  validate([
    check("attemptId").notEmpty().withMessage("attemptId is required"),
    check("answers").isArray({ min: 1 }).withMessage("answers array required"),
  ]),
  submitAttempt
);
router.get(
  "/registration/status/:examId",
  checkRole("student"),
  getRegistrationStatus
);

export default router;
