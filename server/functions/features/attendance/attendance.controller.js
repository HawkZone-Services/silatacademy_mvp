import asyncHandler from "express-async-handler";
import {
  upsertAttendanceMark,
  listAttendanceByPlayerAndBelt,
  listMyAttendanceByBelt,
} from "../features/attendance/attendance.service.js";
import { getAttendanceEligibilityForBelt } from "../features/attendance/attendance.eligibility.js";
import Player from "../models/Player.js";
import { httpError } from "../utils/validation.js";

export const markAttendance = asyncHandler(async (req, res) => {
  const attendance = await upsertAttendanceMark({
    markerUserId: req.user._id,
    studentUserId: req.body.studentUserId,
    beltLevel: req.body.beltLevel,
    sessionDate: req.body.sessionDate,
    status: req.body.status,
    note: req.body.note,
  });

  res.json({ success: true, attendance });
});

export const myAttendanceLogs = asyncHandler(async (req, res) => {
  const { beltLevel } = req.query;
  const logs = await listMyAttendanceByBelt({
    userId: req.user._id,
    beltLevel,
  });

  res.json({ success: true, attendance: logs });
});

export const myAttendanceEligibility = asyncHandler(async (req, res) => {
  const { beltLevel } = req.query;

  const eligibility = await getAttendanceEligibilityForBelt({
    userId: req.user._id,
    beltLevel,
  });

  res.json({ success: true, data: eligibility });
});

export const playerAttendance = asyncHandler(async (req, res) => {
  const logs = await listAttendanceByPlayerAndBelt({
    playerId: req.params.playerId,
    beltLevel: req.query.beltLevel,
  });

  res.json({ success: true, attendance: logs });
});
