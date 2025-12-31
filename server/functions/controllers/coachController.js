import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Coach from "../models/Coach.js";
import Player from "../models/Player.js";
import BeltHistory from "../models/BeltHistory.js";
import Notification from "../models/Notification.js";
import TrainingTask from "../models/TrainingTask.js";
import LessonProgress from "../models/LessonProgress.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Lesson from "../models/Lesson.js";
import Exam from "../models/Exam.js";
import { normalizeBelt } from "../utils/belt.js";
import { assertObjectId, httpError, toObjectId } from "../utils/validation.js";
import Media from "../models/Media.js";
import { uploadGalleryImage } from "../services/mediaService.js";

/* =====================================================
   1) LIST COACHES
===================================================== */
export const listCoaches = asyncHandler(async (req, res) => {
  const coaches = await Coach.find().populate("user", "name email avatarUrl");

  res.json(coaches);
});

/* =====================================================
   2) GET COACH
===================================================== */
export const getCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findById(req.params.id).populate(
    "user",
    "name email avatarUrl"
  );

  if (!coach) throw httpError(404, "Coach not found");
  res.json(coach);
});

/* =====================================================
   3) CREATE COACH
===================================================== */
export const createCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.create(req.body);
  res.status(201).json(coach);
});

/* =====================================================
   4) UPDATE COACH
===================================================== */
export const updateCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!coach) throw httpError(404, "Coach not found");
  res.json(coach);
});

/* =====================================================
   5) LIST PENDING BELT UPGRADES
===================================================== */
export const listPendingUpgrades = asyncHandler(async (req, res) => {
  const pending = await BeltHistory.find({ status: "pending" })
    .populate("player", "beltLevel user")
    .populate("user", "name email")
    .populate("examId", "title beltLevel")
    .populate("attemptId", "_id");

  res.json({ success: true, pending });
});

/* =====================================================
   6) APPROVE BELT UPGRADE
===================================================== */
export const approveBeltUpgrade = asyncHandler(async (req, res) => {
  const { toBelt, note } = req.body;
  const historyId = assertObjectId(req.params.id);

  const history = await BeltHistory.findById(historyId);
  if (!history) throw httpError(404, "Upgrade request not found");

  if (history.status !== "pending") {
    throw httpError(409, "Upgrade request is not pending");
  }

  const player = await Player.findById(history.player);
  if (!player) throw httpError(404, "Player not found");

  const newBelt = toBelt || history.toBelt;
  if (!newBelt) throw httpError(400, "Invalid target belt");

  // 🛡 Guard: prevent silent target belt change
  if (toBelt && normalizeBelt(toBelt) !== normalizeBelt(history.toBelt)) {
    throw httpError(
      400,
      "Target belt differs from requested upgrade. Use an override flow if needed."
    );
  }

  // Update player
  player.beltLevel = newBelt;
  await player.save();

  // Update history
  history.status = "approved";
  history.toBelt = newBelt;
  history.approvedAt = new Date();
  history.approvedBy = req.user?._id ? toObjectId(req.user._id) : undefined;
  if (note) history.note = note;
  await history.save();

  // Notify user
  await Notification.create({
    user: player.user,
    title: "Belt Upgrade Approved",
    message: `Your belt has been upgraded to ${newBelt}.`,
    type: "belt",
  });

  res.json({ success: true, history, player });
});

/* =====================================================
   7) GET STUDENT LESSON PROGRESS (with populate)
===================================================== */
export const getStudentLessonProgress = asyncHandler(async (req, res) => {
  const playerId = assertObjectId(req.params.id);

  const player = await Player.findById(playerId);
  if (!player) throw httpError(404, "Player not found");

  const userId = player.user;

  const progress = await LessonProgress.find({ user: userId })
    .populate("lesson")
    .sort({ updatedAt: -1 });

  res.json({ success: true, progress });
});

/* =====================================================
   8) GET STUDENT EXAM ATTEMPTS
===================================================== */
export const getStudentExamAttempts = asyncHandler(async (req, res) => {
  const playerId = assertObjectId(req.params.id);

  const player = await Player.findById(playerId);
  if (!player) throw httpError(404, "Player not found");

  const attempts = await ExamAttempt.find({ student: player.user })
    .populate("exam")
    .sort({ submittedAt: -1 });

  res.json({ success: true, attempts });
});

/* =====================================================
   9) ASSIGN TRAINING TASK
===================================================== */
export const assignTrainingTask = asyncHandler(async (req, res) => {
  const { playerId, title, description, dueDate } = req.body;

  const task = await TrainingTask.create({
    player: assertObjectId(playerId),
    coach: req.user?._id,
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  await Notification.create({
    user: req.body.userId,
    title: "New Training Task",
    message: `Task assigned: ${title}`,
    type: "system",
  });

  res.status(201).json({ success: true, task });
});

/* =====================================================
   10) GET PLAYER TASKS
===================================================== */
export const getPlayerTasks = asyncHandler(async (req, res) => {
  const playerId = assertObjectId(req.params.id);

  const tasks = await TrainingTask.find({ player: playerId })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, tasks });
});

/* =====================================================
   UPLOAD COACH GALLERY IMAGE
===================================================== */
export const uploadCoachGallery = asyncHandler(async (req, res) => {
  const coachId = assertObjectId(req.params.id, "coachId");

  if (!req.file) {
    throw httpError(400, "Image file is required");
  }

  // 1️⃣ Load coach
  const coach = await Coach.findById(coachId);
  if (!coach) {
    throw httpError(404, "Coach not found");
  }

  // 2️⃣ Upload image to Firebase + Media collection
  const media = await uploadGalleryImage({
    userId: coach.user, // owner
    buffer: req.file.buffer,
    visibility: "public",
    uploadedBy: req.user._id,
  });

  // 3️⃣ Optional: store reference on coach (legacy compatibility)
  coach.gallery = coach.gallery || [];
  coach.gallery.push(media.url);
  await coach.save();

  res.status(201).json({
    success: true,
    data: { media },
  });
});
