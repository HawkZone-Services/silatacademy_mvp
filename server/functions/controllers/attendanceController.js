import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";
import { awardXpForEvent } from "../utils/xp.js";
import LessonProgress from "../models/LessonProgress.js";
import Player from "../models/Player.js";
import { computeAttendanceProgress } from "../services/beltEligibilityService.js";
// داخل addAttendance / markAttendance بعد الإنشاء:
import Lesson from "../models/Lesson.js";
import { httpError, assertObjectId } from "../utils/validation.js";
const getMyPlayerId = async (userId) => {
  const player = await Player.findOne({ user: userId }).select("_id").lean();
  if (!player) throw httpError(404, "Player profile not found");
  return player._id;
};

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

  const playerId = await getMyPlayerId(userId);

  const logs = await Attendance.find({ player: playerId })
    .sort({
      sessionDate: -1,
    })
    .lean();

  res.json({ success: true, attendance: logs });
});

export const myAttendanceSummary = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const playerId = await getMyPlayerId(userId);

  const [total, present] = await Promise.all([
    Attendance.countDocuments({ player: playerId }),
    Attendance.countDocuments({ player: playerId, status: "present" }),
  ]);

  const ratio = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json({
    success: true,
    data: {
      totalSessions: total,
      attendedSessions: present,
      absentSessions: total - present,
      attendanceRate: ratio,
      lastSessionDate: null, // optional: set in /my endpoint to avoid extra query
    },
  });
});

export const myAttendance = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const playerId = await getMyPlayerId(userId);
  if (!playerId) throw httpError(404, "Player profile not found");

  const [logs, total, present] = await Promise.all([
    Attendance.find({ player: playerId }).sort({ sessionDate: -1 }),
    Attendance.countDocuments({ player: playerId }),
    Attendance.countDocuments({ player: playerId, status: "present" }),
  ]);

  const ratio = total > 0 ? Math.round((present / total) * 100) : 0;
  const beltProgress = await computeAttendanceProgress(userId);
  res.json({
    success: true,
    data: {
      attendance: logs,
      summary: {
        totalSessions: total,
        attendedSessions: present,
        absentSessions: total - present,
        attendanceRate: ratio,
        beltProgress,
        lastSessionDate: logs?.[0]?.sessionDate || null,
      },
    },
  });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const lessonId = assertObjectId(req.body.lessonId, "lessonId");

  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw httpError(404, "Lesson not found");

  // لازم يكون فيه Progress موجود (من track steps/quiz/assignment)
  const progress = await LessonProgress.findOne({
    user: userId,
    lesson: lessonId,
  });
  if (!progress) throw httpError(404, "Lesson progress not found");

  // نفس gates بتاعت completeStudentLesson
  if (
    !progress.videoCompleted ||
    !progress.pdfCompleted ||
    !progress.drillCompleted ||
    !progress.safetyCompleted
  ) {
    throw httpError(403, "All lesson steps must be completed first");
  }

  if (!progress.quickCheckPassed) {
    throw httpError(403, "Quick Check must be passed");
  }

  if (progress.assignmentRequired && progress.assignmentStatus !== "approved") {
    throw httpError(403, "Assignment must be approved");
  }

  progress.completed = true;
  progress.lessonState = "completed";
  progress.completedAt = new Date();
  await progress.save();

  res.json({ success: true, progress });
});
