import Player from "../models/Player.js";
import LessonProgress from "../models/LessonProgress.js";
import FinalExamResult from "../models/FinalExamResult.js";
import BeltHistory from "../models/BeltHistory.js";
import { getBeltModuleCompletion } from "./beltModuleCompletionService.js";
import Attendance from "../models/Attendance.js";
import BeltRanking from "../models/BeltRanking.js";
import { httpError } from "../utils/validation.js";
import { getAttendanceEligibilityForBelt } from "../features/attendance/attendance.eligibility.js";

const getNextBeltName = async (currentBelt) => {
  const all = await BeltRanking.find({}).sort({ order: 1 }).lean();
  const idx = all.findIndex(
    (b) => b.name.toLowerCase() === String(currentBelt).toLowerCase(),
  );
  if (idx === -1 || idx === all.length - 1) return null;
  return all[idx + 1].name;
};

export const evaluatePromotionOrThrow = async ({
  userId,
  beltLevel,
  examId,
}) => {
  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found");

  if (player.beltLevel.toLowerCase() !== beltLevel.toLowerCase()) {
    throw httpError(403, "BELT_MISMATCH");
  }

  const completion = await getBeltModuleCompletion({ userId, beltLevel });
  if (!completion.A || !completion.B || !completion.P) {
    throw httpError(403, "MODULES_INCOMPLETE");
  }

  const pendingAssignments = await LessonProgress.exists({
    user: userId,
    beltLevel,
    assignmentRequired: true,
    assignmentStatus: { $ne: "approved" },
  });
  if (pendingAssignments) {
    throw httpError(403, "PENDING_ASSIGNMENTS");
  }

  const attendance = await getAttendanceEligibilityForBelt({
    userId,
    beltLevel,
  });
  if (!attendance.eligible) {
    throw httpError(403, "ATTENDANCE_NOT_MET", { attendance });
  }

  if (!examId) throw httpError(400, "EXAM_ID_REQUIRED");

  const final = await FinalExamResult.findOne({
    exam: examId,
    student: userId,
  }).lean();

  if (!final?.passed) {
    throw httpError(403, "FINAL_EXAM_NOT_PASSED");
  }

  const nextBelt = await getNextBeltName(beltLevel);
  if (!nextBelt) throw httpError(400, "NO_NEXT_BELT");

  return { player, nextBelt };
};

export const promoteStudent = async ({
  userId,
  beltLevel,
  examId,
  approvedBy,
}) => {
  const { player, nextBelt } = await evaluatePromotionOrThrow({
    userId,
    beltLevel,
    examId,
  });

  // update belt
  player.beltLevel = nextBelt;
  await player.save();

  // close belt history (optional)
  await BeltHistory.updateMany(
    { player: player._id, fromBelt: beltLevel, status: "pending" },
    { $set: { status: "approved", approvedBy, approvedAt: new Date() } },
  );

  return { nextBelt };
};
