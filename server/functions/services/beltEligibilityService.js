import Attendance from "../models/Attendance.js";
import BeltRanking from "../models/BeltRanking.js";
import Player from "../models/Player.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
export const computeAttendanceProgress = async (userId) => {
  const player = await Player.findOne({ user: userId });
  if (!player) return null;

  const belt = await BeltRanking.findOne({
    name: new RegExp(player.beltLevel, "i"),
  });

  if (!belt?.attendance) return null;

  const total = await Attendance.countDocuments({ player: player._id });
  const present = await Attendance.countDocuments({
    player: player._id,
    status: "present",
  });

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    totalSessions: total,
    attendedSessions: present,
    requiredSessions: belt.attendance.requiredSessions,
    attendanceRate: rate,
    minRate: belt.attendance.minRate,
    eligible:
      present >= belt.attendance.requiredSessions &&
      rate >= belt.attendance.minRate,
  };
};

export const checkExamEligibility = async (userId) => {
  /* =========================
     PLAYER + BELT
  ========================== */
  const player = await Player.findOne({ user: userId }).lean();
  if (!player) return null;

  const belt = await BeltRanking.findOne({
    name: new RegExp(player.beltLevel, "i"),
  }).lean();

  if (!belt) return null;

  const reasons = [];

  /* =========================
     ATTENDANCE (✔ corrected)
  ========================== */
  const presentSessions = await Attendance.countDocuments({
    player: player._id,
    status: "present",
  });

  const requiredSessions = belt.attendance.requiredSessions || 0;
  const minRate = belt.attendance.minRate || 0;

  const attendanceRate =
    requiredSessions > 0
      ? Math.round((presentSessions / requiredSessions) * 100)
      : 0;

  const attendancePassed =
    requiredSessions === 0 ? true : attendanceRate >= minRate;

  if (!attendancePassed) {
    reasons.push(
      `Attendance requirement not met (${attendanceRate}% / min ${minRate}%)`
    );
  }

  /* =========================
     LESSONS + QUIZZES
  ========================== */
  const totalLessonsRequired = belt.lessons.totalLessons || 0;

  const lessons = await Lesson.find({ isActive: true }).select("_id").lean();

  const progresses = await LessonProgress.find({
    user: userId,
    lesson: { $in: lessons.map((l) => l._id) },
  }).lean();

  const completedLessons = progresses.filter((p) => p.completed);
  const passedQuizzes = progresses.filter(
    (p) => typeof p.quizScore === "number" && p.quizScore >= 60
  );

  const lessonsPassed =
    totalLessonsRequired === 0
      ? true
      : completedLessons.length >= totalLessonsRequired;

  const quizzesPassed =
    totalLessonsRequired === 0
      ? true
      : passedQuizzes.length >= totalLessonsRequired;

  if (!lessonsPassed) {
    reasons.push(
      `Complete all lessons (${completedLessons.length}/${totalLessonsRequired})`
    );
  }

  if (!quizzesPassed) {
    reasons.push(
      `Pass all quizzes (${passedQuizzes.length}/${totalLessonsRequired})`
    );
  }

  /* =========================
     FINAL DECISION
  ========================== */
  const eligible = attendancePassed && lessonsPassed && quizzesPassed;

  return {
    eligible,
    reasons,

    attendance: {
      attended: presentSessions,
      required: requiredSessions,
      rate: attendanceRate,
      minRate,
      passed: attendancePassed,
    },

    lessons: {
      completed: completedLessons.length,
      total: totalLessonsRequired,
      passed: lessonsPassed,
    },

    quizzes: {
      passed: passedQuizzes.length,
      total: totalLessonsRequired,
      passedAll: quizzesPassed,
    },
  };
};
