import asyncHandler from "express-async-handler";
import Coach from "../models/Coach.js";
import Player from "../models/Player.js";
import BeltHistory from "../models/BeltHistory.js";
import Notification from "../models/Notification.js";
import TrainingTask from "../models/TrainingTask.js";
import { getDb } from "../utils/mongodb.js";
import { assertObjectId, httpError, toObjectId } from "../utils/validation.js";

export const listCoaches = asyncHandler(async (req, res) => {
  const coaches = await Coach.find().populate("user", "name email avatarUrl");
  res.json(coaches);
});

export const getCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findById(req.params.id).populate(
    "user",
    "name email avatarUrl"
  );
  if (!coach) return res.status(404).json({ message: "Coach not found" });
  res.json(coach);
});

export const createCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.create(req.body);
  res.status(201).json(coach);
});

export const updateCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!coach) return res.status(404).json({ message: "Coach not found" });
  res.json(coach);
});

export const listPendingUpgrades = asyncHandler(async (req, res) => {
  const pending = await BeltHistory.find({ status: "pending" })
    .populate("player", "beltLevel user")
    .populate("user", "name email")
    .populate("examId", "title beltLevel")
    .populate("attemptId", "_id");

  res.json({ success: true, pending });
});

export const approveBeltUpgrade = asyncHandler(async (req, res) => {
  const { toBelt, note } = req.body;
  const historyId = assertObjectId(req.params.id, "historyId");

  const history = await BeltHistory.findById(historyId);
  if (!history) throw httpError(404, "Upgrade request not found");

  const player = await Player.findById(history.player);
  if (!player) throw httpError(404, "Player not found");

  const newBelt = toBelt || player.beltLevel;
  player.beltLevel = newBelt;
  await player.save();

  history.status = "approved";
  history.toBelt = newBelt;
  history.approvedAt = new Date();
  history.approvedBy = req.user?._id ? toObjectId(req.user._id) : undefined;
  if (note) history.note = note;
  await history.save();

  await Notification.create({
    user: player.user,
    title: "Belt Upgrade Approved",
    message: `Your belt has been upgraded to ${newBelt}.`,
    type: "belt",
  });

  res.json({ success: true, history, player });
});

export const getStudentLessonProgress = asyncHandler(async (req, res) => {
  const db = await getDb();
  const playerId = assertObjectId(req.params.id, "playerId");
  const player = await Player.findById(playerId);
  if (!player) throw httpError(404, "Player not found");

  const userId = player.user;

  const progress = await db
    .collection("lessonprogresses")
    .aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "lessons",
          localField: "lesson",
          foreignField: "_id",
          as: "lesson",
        },
      },
      { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
      { $sort: { updatedAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, progress });
});

export const getStudentExamAttempts = asyncHandler(async (req, res) => {
  const db = await getDb();
  const playerId = assertObjectId(req.params.id, "playerId");
  const player = await Player.findById(playerId);
  if (!player) throw httpError(404, "Player not found");
  const userId = player.user;

  const attempts = await db
    .collection("examAttempts")
    .aggregate([
      { $match: { student: userId } },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
      { $sort: { submittedAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, attempts });
});

export const assignTrainingTask = asyncHandler(async (req, res) => {
  const { playerId, title, description, dueDate } = req.body;
  const playerObj = assertObjectId(playerId, "playerId");

  const task = await TrainingTask.create({
    player: playerObj,
    coach: req.user?._id ? toObjectId(req.user._id) : undefined,
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  await Notification.create({
    user: req.body.userId || undefined,
    title: "New Training Task",
    message: `Task assigned: ${title}`,
    type: "system",
  });

  res.status(201).json({ success: true, task });
});

export const getPlayerTasks = asyncHandler(async (req, res) => {
  const playerId = assertObjectId(req.params.id, "playerId");
  const tasks = await TrainingTask.find({ player: playerId })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, tasks });
});
