import express from "express";
import {
  submitAssignment,
  getLessonAssignments,
  reviewAssignment,
} from "../controllers/assignmentController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/submit", protect, submitAssignment);
router.get("/lesson/:lessonId", protect, getLessonAssignments);
router.post("/:id/review", protect, checkRole("instructor"), reviewAssignment);

export default router;
