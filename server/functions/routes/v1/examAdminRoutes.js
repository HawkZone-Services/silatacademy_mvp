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

// 👨‍🏫 admin + instructor
router.use(protect, checkRole("admin", "instructor"));

/* ================================
   REGISTRATIONS
================================ */

router.get("/registrations/:examId", listRegistrations);

router.patch("/registration/:id/approve", approveRegistration);
router.patch("/registration/:id/reject", rejectRegistration);

/* ================================
   EXAMS CRUD
================================ */

router.post(
  "/",
  validate([
    check("title").notEmpty(),
    check("beltLevel").isIn([
      "white",
      "yellow",
      "blue",
      "brown",
      "red",
      "black",
    ]),
    check("questions").optional().isArray(),
  ]),
  createExam
);

router.patch("/:examId/publish", publishExam);

router.patch("/:id", validate([check("id").notEmpty()]), updateExam);

/* ================================
   SUBMISSIONS (THEORY)
================================ */

// list theory submissions + pass/fail
router.get("/submissions/:examId", listSubmissions);

/* ================================
   PRACTICAL
================================ */

router.post(
  "/practical/score",
  validate([
    check("examId").notEmpty(),
    check("studentId").notEmpty(),
    check("scores.morality").isNumeric(),
    check("scores.practicalMethod").isNumeric(),
    check("scores.technique").isNumeric(),
    check("scores.physical").isNumeric(),
    check("scores.mental").isNumeric(),
  ]),
  gradeManual2
);

/* ================================
   FINALIZE
================================ */

router.post(
  "/finalize",
  validate([check("examId").notEmpty(), check("studentId").notEmpty()]),
  combineScores
);

/* ================================
   ESSAY MANUAL GRADE
================================ */

router.post(
  "/attempt/:id/grade",
  validate([check("id").notEmpty(), check("score").optional().isNumeric()]),
  gradeManual
);

export default router;
