import Player from "../models/Player.js";
import LessonProgress from "../models/LessonProgress.js";
import FinalExamResult from "../models/FinalExamResult.js";
import BeltHistory from "../models/BeltHistory.js";
import { getBeltModuleCompletion } from "./beltModuleCompletionService.js";
import Attendance from "../models/Attendance.js";
import BeltRanking from "../models/BeltRanking.js";
import { httpError } from "../utils/validation.js";

const getNextBeltName = async (currentBelt) => {
  const all = await BeltRanking.find({}).sort({ order: 1 }).lean();
  const idx = all.findIndex(
    (b) => b.name.toLowerCase() === String(currentBelt).toLowerCase()
  );
  if (idx === -1 || idx === all.length - 1) return null;
  return all[idx + 1].name;
};

export const evaluatePromotionOrThrow = async ({
  userId,
  beltLevel,
  examId,
}) => {
  // 0) Player موجود؟
  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found");

  // ✅ شرط صريح belt match
  if (
    String(player.beltLevel).toLowerCase() !== String(beltLevel).toLowerCase()
  ) {
    throw httpError(403, "BELT_MISMATCH", {
      playerBelt: player.beltLevel,
      requestedBelt: beltLevel,
    });
  }

  // 1) Gate: A/B/P complete داخل نفس belt
  const completion = await getBeltModuleCompletion({ userId, beltLevel });
  if (!completion.A || !completion.B || !completion.P) {
    throw httpError(403, "MODULES_INCOMPLETE", {
      completion,
    });
  }

  // 2) Gate: Assignments approved (على مستوى belt)
  const pendingAssignments = await LessonProgress.exists({
    user: userId,
    beltLevel,
    assignmentRequired: true,
    assignmentStatus: { $ne: "approved" },
  });

  if (pendingAssignments) {
    throw httpError(403, "PENDING_ASSIGNMENTS");
  }

  // 3) Gate: Attendance eligibility (config-driven)
  const beltConfig = await BeltRanking.findOne({
    name: new RegExp(`^${beltLevel}$`, "i"),
  }).lean();

  if (beltConfig?.attendance) {
    const requiredSessions = beltConfig.attendance.requiredSessions || 0;
    const minRate = beltConfig.attendance.minRate || 0;

    const total = await Attendance.countDocuments({ player: player._id });
    const present = await Attendance.countDocuments({
      player: player._id,
      status: "present",
    });
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    const ok = present >= requiredSessions && rate >= minRate;
    if (!ok) {
      throw httpError(403, "ATTENDANCE_NOT_MET", {
        present,
        requiredSessions,
        rate,
        minRate,
      });
    }
  }

  // 4) Gate: Final Exam passed
  if (examId) {
    const final = await FinalExamResult.findOne({
      exam: examId,
      student: userId,
    }).lean();
    if (!final?.passed) throw httpError(403, "FINAL_EXAM_NOT_PASSED");
  } else {
    // لو ترقية من غير examId → لازم beltHistory pending مربوط بامتحان لاحقًا
    // نخليها strict: نطلب examId
    throw httpError(400, "EXAM_ID_REQUIRED_FOR_PROMOTION");
  }

  // ✅ لو وصلنا هنا = مؤهل للترقية
  const nextBelt = await getNextBeltName(beltLevel);
  if (!nextBelt) {
    throw httpError(400, "No next belt available");
  }

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
    { $set: { status: "approved", approvedBy, approvedAt: new Date() } }
  );

  return { nextBelt };
};
