import express from "express";
import { check } from "express-validator";
import {
  addAttendance,
  playerAttendance,
  coachSessions,
  stats,
  myAttendanceLogs,
  myAttendanceSummary,
  myAttendance,
} from "../controllers/attendanceController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();
router.post(
  "/",
  protect,
  checkRole("admin", "instructor"),
  validate([
    check("player").notEmpty().withMessage("player is required"),
    check("status")
      .optional()
      .isIn(["present", "absent", "late"])
      .withMessage("status invalid"),
  ]),
  addAttendance
);
router.get("/player/:playerId", protect, playerAttendance);
router.get(
  "/coach/:coachId",
  protect,
  checkRole("admin", "instructor"),
  coachSessions
);
router.get("/stats", protect, checkRole("admin"), stats);
router.get("/my", protect, myAttendance);
router.get("/my/logs", protect, myAttendanceLogs);
router.get("/my/summary", protect, myAttendanceSummary);

export default router;
