import express from "express";
import {
  listCoaches,
  getCoach,
  createCoach,
  updateCoach,
  listPendingUpgrades,
  approveBeltUpgrade,
  getStudentLessonProgress,
  getStudentExamAttempts,
  assignTrainingTask,
  getPlayerTasks,
} from "../controllers/coachController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", protect, checkRole("admin", "instructor"), listCoaches);
router.get("/:id", protect, checkRole("admin", "instructor"), getCoach);
router.post("/", protect, checkRole("admin"), createCoach);
router.patch("/:id", protect, checkRole("admin"), updateCoach);

router.get(
  "/belt-upgrades/pending",
  protect,
  checkRole("admin", "instructor"),
  listPendingUpgrades
);
router.patch(
  "/belt-upgrades/:id/approve",
  protect,
  checkRole("admin", "instructor"),
  approveBeltUpgrade
);
router.get(
  "/players/:id/lessons",
  protect,
  checkRole("admin", "instructor"),
  getStudentLessonProgress
);
router.get(
  "/players/:id/exams",
  protect,
  checkRole("admin", "instructor"),
  getStudentExamAttempts
);
router.post(
  "/tasks",
  protect,
  checkRole("admin", "instructor"),
  assignTrainingTask
);
router.get(
  "/players/:id/tasks",
  protect,
  checkRole("admin", "instructor"),
  getPlayerTasks
);

export default router;
