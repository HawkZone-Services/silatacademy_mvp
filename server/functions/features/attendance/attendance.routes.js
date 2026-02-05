import express from "express";
import { protect, checkRole } from "../../middlewares/authMiddleware.js";
import {
  markAttendance,
  listMyAttendance,
  listPlayerAttendance,
  getMyAttendanceEligibility,
  getPlayerIdByUser,
} from "./attendance.controller.js";

const router = express.Router();

// Student
router.get("/me", protect, listMyAttendance);
router.get("/me/eligibility", protect, getMyAttendanceEligibility);

// Coach/Admin
router.post("/mark", protect, checkRole("coach", "admin"), markAttendance);
router.get(
  "/player/:playerId",
  protect,
  checkRole("coach", "admin"),
  listPlayerAttendance,
);

// Optional helper
router.get(
  "/resolve-player/:userId",
  protect,
  checkRole("coach", "admin"),
  getPlayerIdByUser,
);

export default router;
