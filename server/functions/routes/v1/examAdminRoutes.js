import express from "express";
import { check } from "express-validator";

import {
  approveRegistration,
  rejectRegistration,
  listRegistrations,
  createExam,
  publishExam,
  updateExam,
  listSubmissions,
  gradeManual2,
  combineScores,
  gradeManual,
} from "../../controllers/examController.js";

import { protect, checkRole } from "../../middlewares/authMiddleware.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

// Only admin + instructor can access this module
router.use(protect, checkRole("admin", "instructor"));

/* ================================
   REGISTRATION MANAGEMENT
================================ */

// Approve
router.patch("/registration/:id/approve", approveRegistration);

// Reject
router.patch("/registration/:id/reject", rejectRegistration);

// List registrations
router.get("/registrations/:examId", listRegistrations);

/* ================================
   EXAM CRUD
================================ */

// Create exam
router.post(
  "/",
  validate([
    check("title").notEmpty().withMessage("title is required"),
    check("beltLevel")
      .isIn(["white", "yellow", "blue", "brown", "red", "black"])
      .withMessage("beltLevel invalid"),
    check("questions").optional().isArray(),
  ]),
  createExam
);

// Publish exam
router.patch(
  "/:examId/publish",
  validate([check("examId").notEmpty().withMessage("examId is required")]),
  publishExam
);

// Update exam
router.patch(
  "/:id",
  validate([
    check("id").notEmpty().withMessage("id is required"),
    check("beltLevel")
      .optional()
      .isIn(["white", "yellow", "blue", "brown", "red", "black"]),
  ]),
  updateExam
);

/* ================================
   SUBMISSIONS (ADMIN)
================================ */

router.get("/submissions/:examId", listSubmissions);

/* ================================
   PRACTICAL
================================ */

router.post(
  "/practical/score",
  validate([
    check("examId").notEmpty(),
    check("studentId").notEmpty(),
    check("scores.technique").isNumeric(),
    check("scores.performance").isNumeric(),
    check("scores.discipline").isNumeric(),
  ]),
  gradeManual2
);

/* ================================
   FINALIZE (Combine theory + practical)
================================ */

router.post(
  "/finalize",
  validate([check("examId").notEmpty(), check("studentId").notEmpty()]),
  combineScores
);

/* ================================
   GRADE ESSAY MANUAL
================================ */

router.post(
  "/:id/grade",
  validate([
    check("id").notEmpty().withMessage("attempt id is required"),
    check("score").optional().isNumeric(),
  ]),
  gradeManual
);

export default router;
