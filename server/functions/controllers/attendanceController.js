import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";
import { assertObjectId, httpError } from "../utils/validation.js";
import { awardXpForEvent } from "../utils/xp.js";
import LessonProgress from "../models/LessonProgress.js";
import Player from "../models/Player.js";
// داخل addAttendance / markAttendance بعد الإنشاء:

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

  // ← هنا منطقي
  await awardXpForEvent(playerId, "ATTENDANCE");

  res.status(201).json({ success: true, attendance: att });
});

export const playerAttendance = asyncHandler(async (req, res) => {
  const playerId = assertObjectId(req.params.playerId, "playerId");
  const logs = await Attendance.find({ player: playerId }).sort({
    sessionDate: -1,
  });
  res.json({ success: true, attendance: logs });
});

export const coachSessions = asyncHandler(async (req, res) => {
  const coachId = assertObjectId(req.params.coachId, "coachId");
  const logs = await Attendance.find({ coach: coachId }).sort({
    sessionDate: -1,
  });
  res.json({ success: true, attendance: logs });
});

export const stats = asyncHandler(async (req, res) => {
  const agg = await Attendance.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json({ success: true, stats: agg });
});

export const myAttendanceLogs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");
  const logs = await Attendance.find({ player: userId }).sort({
    sessionDate: -1,
  });
  res.json({ success: true, attendance: logs });
});

export const myAttendanceSummary = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const [total, present] = await Promise.all([
    Attendance.countDocuments({ player: userId }),
    Attendance.countDocuments({ player: userId, status: "present" }),
  ]);
  const ratio = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json({
    success: true,
    data: {
      totalSessions: total,
      attendedSessions: present,
      absentSessions: total - present,
      attendanceRate: ratio,
    },
  });
});

export const myAttendance = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const [logs, total, present] = await Promise.all([
    Attendance.find({ player: userId }).sort({ sessionDate: -1 }),
    Attendance.countDocuments({ player: userId }),
    Attendance.countDocuments({ player: userId, status: "present" }),
  ]);
  const ratio = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json({
    success: true,
    data: {
      attendance: logs,
      summary: {
        totalSessions: total,
        attendedSessions: present,
        absentSessions: total - present,
        attendanceRate: ratio,
      },
    },
  });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { lessonId } = req.body;

  // upsert progress
  const progress = await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    { completed: true, completedAt: new Date() },
    { new: true, upsert: true }
  );

  // إحضار اللاعب المرتبط بالمستخدم
  const player = await Player.findOne({ user: userId });
  if (player) {
    // زيادة عداد الدروس (لو أول مرة يكمل هذا الدرس)
    const alreadyCompleted = await LessonProgress.countDocuments({
      user: userId,
      lesson: lessonId,
      completed: true,
    });

    if (alreadyCompleted === 1) {
      player.totalLessonsCompleted = (player.totalLessonsCompleted || 0) + 1;
      await player.save();
      await awardXpForEvent(player._id, "LESSON_COMPLETE");
    }
  }

  res.json({ success: true, progress });
});
