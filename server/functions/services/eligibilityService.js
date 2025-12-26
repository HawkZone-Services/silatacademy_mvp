import Attendance from "../models/Attendance.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Program from "../models/Program.js";
import Player from "../models/Player.js";
import ExamRegistration from "../models/ExamRegistration.js";
import ExamAttempt from "../models/ExamAttempt.js";
import FinalExamResult from "../models/FinalExamResult.js";
import { toObjectId } from "../utils/validation.js";
import Exam from "../models/Exam.js";

/* =========================
   HELPERS
========================= */
export const beltToProgramLevel = (belt) => {
  if (["white", "yellow"].includes(belt)) return "beginner";
  if (["blue", "brown"].includes(belt)) return "intermediate";
  if (["red", "black"].includes(belt)) return "advanced";
  return null;
};

export const getPlayerForUser = async (userId) => {
  if (!userId) return null;
  return Player.findOne({ user: userId });
};

export const getAttendanceSummary = async (playerId) => {
  if (!playerId) {
    return { total: 0, present: 0, ratio: 0 };
  }

  const player = await Player.findById(playerId).select("beltLevel");
  if (!player) {
    return { total: 0, present: 0, ratio: 0 };
  }

  const belt = player.beltLevel;

  const [total, present] = await Promise.all([
    Attendance.countDocuments({
      player: playerId,
      beltLevel: belt,
    }),
    Attendance.countDocuments({
      player: playerId,
      status: "present",
      beltLevel: belt,
    }),
  ]);

  const ratio = total > 0 ? Math.round((present / total) * 100) : 0;

  return { total, present, ratio };
};

export const hasMinimumAttendance = (summary) => {
  if (!summary.total) return true;
  return summary.ratio >= 50;
};

export const lessonCompletionForBelt = async (userId, beltLevel) => {
  const level = beltToProgramLevel(beltLevel);
  if (!level) return { total: 0, completed: 0 };

  const [totalLessons] = await Lesson.aggregate([
    {
      $lookup: {
        from: Program.collection.name,
        localField: "program",
        foreignField: "_id",
        as: "program",
      },
    },
    { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
    { $match: { "program.level": level } },
    { $count: "count" },
  ]);

  const [completedLessons] = await LessonProgress.aggregate([
    { $match: { user: toObjectId(userId), completed: true } },
    {
      $lookup: {
        from: Lesson.collection.name,
        localField: "lesson",
        foreignField: "_id",
        as: "lesson",
      },
    },
    { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Program.collection.name,
        localField: "lesson.program",
        foreignField: "_id",
        as: "program",
      },
    },
    { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
    { $match: { "program.level": level } },
    { $count: "count" },
  ]);

  return {
    total: totalLessons?.count || 0,
    completed: completedLessons?.count || 0,
  };
};

/* =========================
   CORE ELIGIBILITY (PATCHED)
========================= */
export const buildExamEligibility = async ({
  exam,
  userId,
  registration,
  attempt,
  finalResult,
}) => {
  const player = await getPlayerForUser(userId);

  const attendanceSummary = await getAttendanceSummary(player?._id);
  const attendanceOK = hasMinimumAttendance(attendanceSummary);

  const lessonStatus = await lessonCompletionForBelt(userId, exam?.beltLevel);

  const lockedReasons = [];

  if (lessonStatus.total > 0 && lessonStatus.completed < lessonStatus.total) {
    lockedReasons.push("COMPLETE_REQUIRED_LESSONS");
  }

  if (!attendanceOK) {
    lockedReasons.push("INSUFFICIENT_ATTENDANCE");
  }

  const locked = lockedReasons.length > 0;
  const lockedReason = lockedReasons[0] || null;

  // ✅ نظري
  const theorySubmitted = Boolean(attempt?.submittedAt);
  const theoryScore = attempt?.theoryScore ?? attempt?.autoScore ?? null;
  const theoryPassed = typeof attempt?.pass === "boolean" ? attempt.pass : null;

  // ✅ Finalized
  const finalized = Boolean(finalResult?._id);

  return {
    locked,
    isEligible: !locked,
    lockedReason,
    reasonIfNotEligible: lockedReason,
    lockedReasons,
    lessonsRequired: lessonStatus.total,
    lessonsCompleted: lessonStatus.completed,

    // ✅ Registration
    registrationStatus: registration?.status || null,
    registrationId: registration?._id || null,

    // ✅ Theory state
    attemptId: attempt?._id || null,
    theorySubmitted,
    theoryScore,
    theoryPassed,

    // ✅ Final state
    finalized,
  };
};

export const attachExamEligibility = async (exams = [], userId) => {
  const normalized = exams.map((exam) =>
    exam?.toObject ? { ...exam.toObject(), _id: exam._id } : exam
  );

  const player = await Player.findOne({ user: userId }).lean();

  const examIds = normalized.map((e) => e?._id).filter(Boolean);

  const [registrations, attempts, finals] = await Promise.all([
    player
      ? ExamRegistration.find({
          player: player._id,
          exam: { $in: examIds },
        }).lean()
      : [],
    ExamAttempt.find({ student: userId, exam: { $in: examIds } })
      .sort({ submittedAt: -1, createdAt: -1, _id: -1 })
      .lean(),
    FinalExamResult.find({ student: userId, exam: { $in: examIds } }).lean(),
  ]);

  const regMap = new Map(registrations.map((r) => [String(r.exam), r]));

  // latest attempt per exam
  const attemptMap = new Map();
  for (const a of attempts) {
    const k = String(a.exam);
    if (!attemptMap.has(k)) attemptMap.set(k, a);
  }

  const finalMap = new Map(finals.map((f) => [String(f.exam), f]));

  return Promise.all(
    normalized.map(async (exam) => {
      const eligibility = await buildExamEligibility({
        exam,
        userId,
        registration: regMap.get(String(exam._id)),
        attempt: attemptMap.get(String(exam._id)) || null,
        finalResult: finalMap.get(String(exam._id)) || null,
      });

      return {
        ...exam,
        ...eligibility,
      };
    })
  );
};

/* =========================
   LESSON ELIGIBILITY (UNCHANGED)
========================= */
export const mapLessonEligibility = (
  lesson,
  { progressMap = new Map(), prereqSet = new Set(), attendanceOK = true } = {}
) => {
  const progress = progressMap.get(lesson._id.toString());

  const completed = Boolean(progress?.completed);
  const quizScore = progress?.quizScore ?? null;
  const attempts = progress?.attempts ?? 0;

  const hasPrereq =
    lesson.prerequisiteLesson &&
    prereqSet.has(lesson.prerequisiteLesson.toString());

  const lockedReasons = [];

  // 🔒 Prerequisite gate
  if (lesson.prerequisiteLesson && !hasPrereq) {
    lockedReasons.push("PREREQUISITE_NOT_COMPLETED");
  }

  // 🔒 Attendance gate (belt-scoped)
  if (!attendanceOK) {
    lockedReasons.push("INSUFFICIENT_ATTENDANCE");
  }

  const lockedReason = lockedReasons[0] || null;
  const locked = lockedReasons.length > 0;

  return {
    _id: lesson._id,
    title: lesson.title,
    description: lesson.description,
    program: lesson.program,
    module: lesson.module,
    order: lesson.order || 0,

    // 🎯 Belt / level awareness
    level: lesson.level || lesson.beltLevel || null,

    type: lesson.type || "theory",
    videoUrl: lesson.videoUrl,
    resources: lesson.resources || [],

    // 📊 Progress
    completed,
    quizScore,
    attempts,

    // 🔐 Eligibility
    locked,
    lockedReason,
    reasonIfNotEligible: lockedReason,
    isEligible: !locked,
    canStart: !locked,
  };
};

/* =========================
   FIXED: registration lookup uses Player._id
========================= */
export const getRegistrationForExam = async (examId, userId) => {
  const examObj = toObjectId(examId);
  const userObj = toObjectId(userId);
  if (!examObj || !userObj) return null;

  const player = await Player.findOne({ user: userObj }).select("_id").lean();
  if (!player?._id) return null;

  return ExamRegistration.findOne({ exam: examObj, player: player._id });
};

/* =========================
   (legacy) getStudentEligibility — leave as-is if you still use it elsewhere
========================= */
export const getStudentEligibility = async ({ userId, beltLevel }) => {
  const exam = await Exam.findOne({ beltLevel, isActive: true });
  return {
    exam: { examId: exam?._id || null, status: "locked" },
    eligibleForBelt: false,
  };
};
