import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";
import { assertObjectId, httpError } from "../utils/validation.js";

export const addAttendance = asyncHandler(async (req, res) => {
  const { player, coach, status, sessionDate, sessionId, notes } = req.body;

  const playerId = assertObjectId(player, "player");
  const coachId = coach ? assertObjectId(coach, "coach") : null;

  const allowedStatuses = ["present", "absent", "late"];
  if (status && !allowedStatuses.includes(status)) {
    throw httpError(400, "Invalid status");
  }

  const att = await Attendance.create({
    player: playerId,
    coach: coachId,
    status: status || "present",
    sessionDate: sessionDate ? new Date(sessionDate) : undefined,
    sessionId,
    notes,
  });
  res.status(201).json(att);
});

export const playerAttendance = asyncHandler(async (req, res) => {
  const playerId = assertObjectId(req.params.playerId, "playerId");
  const logs = await Attendance.find({ player: playerId }).sort({
    sessionDate: -1,
  });
  res.json(logs);
});

export const coachSessions = asyncHandler(async (req, res) => {
  const coachId = assertObjectId(req.params.coachId, "coachId");
  const logs = await Attendance.find({ coach: coachId }).sort({
    sessionDate: -1,
  });
  res.json(logs);
});

export const stats = asyncHandler(async (req, res) => {
  const agg = await Attendance.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json(agg);
});
