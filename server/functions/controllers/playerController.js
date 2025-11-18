import asyncHandler from "express-async-handler";
import Player from "../models/Player.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import { getDb } from "../utils/mongodb.js";

export const listPlayers = asyncHandler(async (req, res) => {
  const db = await getDb();

  const players = await db
    .collection("playerProfiles")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ])
    .toArray();

  res.status(200).json(players);
});

export const getPlayer = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  const player = await db
    .collection("playerProfiles")
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ])
    .toArray();

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
