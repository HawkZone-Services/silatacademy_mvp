import Player from "../models/Player.js";
import LessonProgress from "../models/LessonProgress.js";
import Attendance from "../models/Attendance.js";
import BeltRanking from "../models/BeltRanking.js";
import { httpError } from "../utils/validation.js";
import { getAttendanceEligibilityForBelt } from "../features/attendance/attendance.eligibility.js";

export const checkLevelGatesOrThrow = async ({
  userId,
  beltLevel,
  requireAttendance = true,
  requireLessons = true,
  requireAssignments = true,
}) => {
  if (requireLessons) {
    const hasIncompleteLessons = await LessonProgress.exists({
      user: userId,
      beltLevel,
      completed: false,
    });
    if (hasIncompleteLessons) {
      throw httpError(403, "LESSONS_INCOMPLETE");
    }
  }

  if (requireAssignments) {
    const hasPendingAssignments = await LessonProgress.exists({
      user: userId,
      beltLevel,
      assignmentRequired: true,
      assignmentStatus: { $ne: "approved" },
    });
    if (hasPendingAssignments) {
      throw httpError(403, "ASSIGNMENTS_PENDING");
    }
  }

  if (requireAttendance) {
    const attendance = await getAttendanceEligibilityForBelt({
      userId,
      beltLevel,
    });

    if (!attendance.eligible) {
      throw httpError(403, "ATTENDANCE_NOT_MET", { attendance });
    }
  }

  return { ok: true };
};
