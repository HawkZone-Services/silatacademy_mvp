import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";

export const addAttendance = asyncHandler(async (req, res) => {
  const att = await Attendance.create(req.body);
  res.status(201).json(att);
});

export const playerAttendance = asyncHandler(async (req, res) => {
  const { playerId } = req.params;
  const logs = await Attendance.find({ player: playerId }).sort({
    sessionDate: -1,
  });
  res.json(logs);
});

export const coachSessions = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
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
