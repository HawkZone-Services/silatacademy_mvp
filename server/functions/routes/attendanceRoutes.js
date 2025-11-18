import express from "express";
import {
  addAttendance,
  playerAttendance,
  coachSessions,
  stats,
} from "../controllers/attendanceController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", protect, checkRole("admin", "instructor"), addAttendance);
router.get("/player/:playerId", protect, playerAttendance);
router.get(
  "/coach/:coachId",
  protect,
  checkRole("admin", "instructor"),
  coachSessions
);
router.get("/stats", protect, checkRole("admin"), stats);

export default router;
