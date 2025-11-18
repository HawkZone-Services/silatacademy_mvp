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
  listRegistrations,
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
   ADMIN EXAM ROUTES (Isolated under /admin)
================================================ */

router.get(
  "/admin/registrations",
  protect,
  checkRole("admin", "instructor"),
  listRegistrations
);

router.patch(
  "/admin/register/:id/approve",
  protect,
  checkRole("admin", "instructor"),
  approveRegistration
);

router.patch(
  "/admin/register/:id/reject",
  protect,
  checkRole("admin", "instructor"),
  rejectRegistration
);

router.post("/admin", protect, checkRole("admin", "instructor"), createExam);

router.patch(
  "/admin/:examId/publish",
  protect,
  checkRole("admin", "instructor"),
  publishExam
);

router.patch(
  "/admin/:id",
  protect,
  checkRole("admin", "instructor"),
  updateExam
);

router.get(
  "/admin/submissions/:examId",
  protect,
  checkRole("admin", "instructor"),
  listSubmissions
);

router.post(
  "/admin/practical/score",
  protect,
  checkRole("admin", "instructor"),
  gradeManual2
);

router.post(
  "/admin/finalize",
  protect,
  checkRole("admin", "instructor"),
  combineScores
);

router.post(
  "/admin/:id/grade",
  protect,
  checkRole("admin", "instructor"),
  gradeManual
);

export default router;
