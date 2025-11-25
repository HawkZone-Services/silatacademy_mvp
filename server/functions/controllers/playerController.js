import asyncHandler from "express-async-handler";
import Player from "../models/Player.js";
import PlayerProfile from "../models/Profile.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import BeltHistory from "../models/BeltHistory.js";
import Notification from "../models/Notification.js";
import PDFDocument from "pdfkit";
import { assertObjectId, httpError } from "../utils/validation.js";
import { Types } from "mongoose";

export const listPlayers = asyncHandler(async (req, res) => {
  const players = await PlayerProfile.aggregate([
    {
      $lookup: {
        from: User.collection.name,
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ]);

  res.status(200).json(players);
});

export const getPlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const player = await PlayerProfile.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: User.collection.name,
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ]);

  if (!player.length)
    return res.status(404).json({ message: "Player not found" });

  res.status(200).json(player[0]);
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
});

export const deletePlayer = asyncHandler(async (req, res) => {
  const p = await Player.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Player not found" });
  res.json({ success: true });
});

export const addAttendance = asyncHandler(async (req, res) => {
  const { sessionId, date, coachId, status, notes } = req.body;
  const att = await Attendance.create({
    player: req.params.id,
    sessionId,
    sessionDate: date || new Date(),
    coach: coachId,
    status,
    notes,
  });
  await Player.findByIdAndUpdate(req.params.id, {
    $inc: { "training.attendanceCount": 1 },
  });
  res.status(201).json(att);
});

export const getAttendance = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { player: req.params.id };
  if (from || to) filter.sessionDate = {};
  if (from) filter.sessionDate.$gte = new Date(from);
  if (to) filter.sessionDate.$lte = new Date(to);
  const logs = await Attendance.find(filter).sort({ sessionDate: -1 });
  res.json(logs);
});

export const playerReportPdf = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!player) return res.status(404).json({ message: "Player not found" });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.text(`Player: ${player.user.name}`);
  doc.text(`Belt: ${player.beltLevel}`);
  doc.text(
    `Stats: Power ${player.stats?.power || 0}, Flex ${
      player.stats?.flexibility || 0
    }`
  );
  doc.end();
  doc.pipe(res);
});

export const promotePlayer = asyncHandler(async (req, res) => {
  const { nextBelt } = req.body;

  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { beltLevel: nextBelt },
    { new: true }
  );

  res.json({ success: true, player });
});

export const addExamToPlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);

  player.exams.push(req.body);
  await player.save();

  res.json({ success: true, player });
});

export const markPendingUpgrade = asyncHandler(async (req, res) => {
  const { examId, attemptId } = req.body;
  const playerId = assertObjectId(req.params.id, "playerId");

  const player = await Player.findById(playerId);
  if (!player) throw httpError(404, "Player not found");

  const entry = await BeltHistory.create({
    player: playerId,
    user: player.user,
    fromBelt: player.beltLevel,
    toBelt: player.beltLevel,
    status: "pending",
    examId: examId ? assertObjectId(examId, "examId") : undefined,
    attemptId: attemptId ? assertObjectId(attemptId, "attemptId") : undefined,
    note: "Exam passed pending coach approval",
  });

  res.json({ success: true, pendingUpgrade: entry });
});

export const approveUpgrade = asyncHandler(async (req, res) => {
  const { toBelt, note } = req.body;
  const entryId = assertObjectId(req.params.historyId, "historyId");
  const coachId = req.user?._id ? assertObjectId(req.user._id, "coachId") : null;

  const history = await BeltHistory.findById(entryId);
  if (!history) throw httpError(404, "Upgrade request not found");

  const player = await Player.findById(history.player);
  if (!player) throw httpError(404, "Player not found");

  const newBelt = toBelt || player.beltLevel;

  player.beltLevel = newBelt;
  await player.save();

  history.status = "approved";
  history.toBelt = newBelt;
  history.approvedAt = new Date();
  if (coachId) history.approvedBy = coachId;
  if (note) history.note = note;
  await history.save();

  await Notification.create({
    user: player.user,
    title: "Belt Upgraded",
    message: `Your belt has been upgraded to ${newBelt}.`,
    type: "belt",
  });

  res.json({ success: true, history, player });
});
