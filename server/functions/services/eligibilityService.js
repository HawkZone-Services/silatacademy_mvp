import Attendance from "../models/Attendance.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Program from "../models/Program.js";
import Player from "../models/Player.js";
import ExamRegistration from "../models/ExamRegistration.js";
import { toObjectId } from "../utils/validation.js";

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
  if (!playerId) return { total: 0, present: 0, ratio: 0 };

  const [total, present] = await Promise.all([
    Attendance.countDocuments({ player: playerId }),
    Attendance.countDocuments({ player: playerId, status: "present" }),
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

export const buildExamEligibility = async ({
  exam,
  userId,
  registration,
  enforceRegistration = false,
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

  if (enforceRegistration && registration && registration.status !== "approved") {
    lockedReasons.push("REGISTRATION_NOT_APPROVED");
  }

  const lockedReason = lockedReasons[0] || null;

  return {
    locked: lockedReasons.length > 0,
    isEligible: lockedReasons.length === 0,
    lockedReason,
    reasonIfNotEligible: lockedReason,
    lockedReasons,
    attendanceSummary,
    lessonsRequired: lessonStatus.total,
    lessonsCompleted: lessonStatus.completed,
    registrationStatus: registration?.status || null,
  };
};

export const attachExamEligibility = async (
  exams = [],
  userId,
  options = { enforceRegistration: false }
) => {
  if (!userId) {
    return exams.map((exam) => ({
      ...(exam?.toObject ? { ...exam.toObject(), _id: exam._id } : exam),
      locked: false,
      isEligible: true,
      reasonIfNotEligible: null,
      lockedReason: null,
      lockedReasons: [],
      lessonsRequired: exam.lessonsRequired ?? 0,
      lessonsCompleted: exam.lessonsCompleted ?? 0,
    }));
  }

  const normalized = exams.map((exam) =>
    exam?.toObject ? { ...exam.toObject(), _id: exam._id } : exam
  );

  return Promise.all(
    normalized.map(async (exam) => {
      const eligibility = await buildExamEligibility({
        exam,
        userId,
        registration: options.registrationMap?.get(exam._id?.toString?.() || exam._id),
        enforceRegistration: options.enforceRegistration,
      });

      return {
        ...exam,
        ...eligibility,
      };
    })
  );
};

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

  if (lesson.prerequisiteLesson && !hasPrereq) {
    lockedReasons.push("PREREQUISITE_NOT_COMPLETED");
  }

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
    level: lesson.level || lesson.beltLevel || null,
    type: lesson.type || "theory",
    videoUrl: lesson.videoUrl,
    resources: lesson.resources || [],
    completed,
    quizScore,
    attempts,
    locked,
    lockedReason,
    reasonIfNotEligible: lockedReason,
    isEligible: !locked,
    canStart: !locked,
  };
};

export const getRegistrationForExam = async (examId, userId) => {
  const examObj = toObjectId(examId);
  const playerObj = toObjectId(userId);
  if (!examObj || !playerObj) return null;
  return ExamRegistration.findOne({ exam: examObj, player: playerObj });
};
