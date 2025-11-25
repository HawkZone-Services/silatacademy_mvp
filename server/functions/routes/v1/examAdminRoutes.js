import express from "express";
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

const router = express.Router();

router.use(protect, checkRole("admin", "instructor"));

router.patch("/registration/:id/approve", approveRegistration);
router.patch("/registration/:id/reject", rejectRegistration);
router.get("/registrations/:examId", listRegistrations);

router.post("/", createExam);
router.patch("/:examId/publish", publishExam);
router.patch("/:id", updateExam);

router.get("/submissions/:examId", listSubmissions);
router.post("/practical/score", gradeManual2);
router.post("/finalize", combineScores);
router.post("/:id/grade", gradeManual);

export default router;
