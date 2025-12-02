import express from "express";
import { check } from "express-validator";
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
import { validate } from "../middlewares/validate.js";
const router = express.Router();

router.get("/", protect, checkRole("admin", "instructor"), listCoaches);
router.get(
  "/:id",
  protect,
  checkRole("admin", "instructor"),
  validate([check("id").isMongoId()]),
  getCoach
);
router.post(
  "/",
  protect,
  checkRole("admin"),
  validate([check("name").notEmpty()]),
  createCoach
);
router.patch(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("id").isMongoId(), check("name").optional().isString()]),
  updateCoach
);

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
  validate([check("id").isMongoId()]),
  approveBeltUpgrade
);
router.get(
  "/players/:id/lessons",
  protect,
  checkRole("admin", "instructor"),
  validate([check("id").isMongoId()]),
  getStudentLessonProgress
);
router.get(
  "/players/:id/exams",
  protect,
  checkRole("admin", "instructor"),
  validate([check("id").isMongoId()]),
  getStudentExamAttempts
);
router.post(
  "/tasks",
  protect,
  checkRole("admin", "instructor"),
  validate([check("title").notEmpty(), check("player").optional().isMongoId()]),
  assignTrainingTask
);
router.get(
  "/players/:id/tasks",
  protect,
  checkRole("admin", "instructor"),
  validate([check("id").isMongoId()]),
  getPlayerTasks
);

export default router;
