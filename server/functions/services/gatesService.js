import Player from "../models/Player.js";
import LessonProgress from "../models/LessonProgress.js";
import Attendance from "../models/Attendance.js";
import BeltRanking from "../models/BeltRanking.js";
import { httpError } from "../utils/validation.js";

export const checkLevelGatesOrThrow = async ({
  userId,
  beltLevel,
  requireAttendance = true,
  requireLessons = true,
  requireAssignments = true,
}) => {
  // 1) Lessons gate
  if (requireLessons) {
    const hasIncompleteLessons = await LessonProgress.exists({
      user: userId,
      beltLevel,
      completed: false,
    });

    if (hasIncompleteLessons) {
      throw httpError(403, "Complete all lessons before proceeding");
    }
  }

  // 2) Assignments gate
  if (requireAssignments) {
    const hasPendingAssignments = await LessonProgress.exists({
      user: userId,
      beltLevel,
      assignmentRequired: true,
      assignmentStatus: { $ne: "approved" },
    });

    if (hasPendingAssignments) {
      throw httpError(
        403,
        "All assignments must be approved before proceeding"
      );
    }
  }

  // 3) Attendance gate (belt config-driven if available)
  if (requireAttendance) {
    const player = await Player.findOne({ user: userId }).select(
      "_id beltLevel"
    );
    if (!player) throw httpError(404, "Player not found");

    const belt = await BeltRanking.findOne({
      name: new RegExp(beltLevel || player.beltLevel, "i"),
    }).lean();

    // لو مفيش إعدادات، نخليها pass (backward compatible)
    if (!belt?.attendance) return { ok: true };

    const total = await Attendance.countDocuments({ player: player._id });
    const present = await Attendance.countDocuments({
      player: player._id,
      status: "present",
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    const requiredSessions = belt.attendance.requiredSessions || 0;
    const minRate = belt.attendance.minRate || 0;

    const attendanceOK = present >= requiredSessions && rate >= minRate;

    if (!attendanceOK) {
      throw httpError(
        403,
        `Attendance requirements not met (present ${present}/${requiredSessions}, rate ${rate}% / min ${minRate}%)`
      );
    }
  }

  return { ok: true };
};
