import express from "express";
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

const router = express.Router();

router.use(protect, checkRole("student", "admin"));

router.get("/", listExams);
router.get("/available/:beltLevel", checkRole("student"), getExamsByBeltLevel);
router.get("/my-attempts", checkRole("student"), getMyAttempts);
router.get("/:id", getExam);
router.post("/register", checkRole("student"), ExamRegisteration);
router.post("/attempt/start", checkRole("student"), startAttempt);
router.post("/attempt/submit", checkRole("student"), submitAttempt);
router.get(
  "/registration/status/:examId",
  checkRole("student"),
  getRegistrationStatus
);

export default router;
