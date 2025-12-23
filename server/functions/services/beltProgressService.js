// services/beltProgressService.js
import Attendance from "../models/Attendance.js";
import Player from "../models/Player.js";
import BeltRanking from "../models/BeltRanking.js";
import LessonProgress from "../models/LessonProgress.js";
import { httpError } from "../utils/validation.js";

export const getMyBeltProgress = async (userId) => {
  const player = await Player.findOne({ user: userId }).lean();
  if (!player) throw httpError(404, "Player not found");

  const belt = await BeltRanking.findOne({
    name: new RegExp(player.beltLabel || player.beltLevel, "i"),
  }).lean();

  if (!belt) throw httpError(404, "Belt ranking not found");

  // Attendance
  const presentSessions = await Attendance.countDocuments({
    player: player._id,
    status: "present",
  });

  const requiredSessions = belt.attendance.requiredSessions;
  const minRate = belt.attendance.minRate;

  const attendanceRate =
    requiredSessions > 0
      ? Math.round((presentSessions / requiredSessions) * 100)
      : 0;

  const attendancePassed = attendanceRate >= minRate;

  // Lessons
  const totalLessons = belt.lessons.totalLessons;
  const unlockEvery = belt.lessons.unlockEvery;

  const unlockedLessons = Math.min(
    Math.floor(presentSessions / unlockEvery) * 3,
    totalLessons
  );

  const completedLessons = await LessonProgress.countDocuments({
    user: userId,
    completed: true,
  });

  const lessonsPassed = completedLessons >= totalLessons;

  // Exam
  const examEligible = attendancePassed && lessonsPassed;

  return {
    belt: belt.name,
    level: belt.level,

    attendance: {
      attendedSessions: presentSessions,
      requiredSessions,
      minRate,
      attendanceRate,
      passed: attendancePassed,
    },

    lessons: {
      completed: completedLessons,
      unlocked: unlockedLessons,
      required: totalLessons,
      passed: lessonsPassed,
    },

    exams: {
      eligible: examEligible,
      lockedReason: !attendancePassed
        ? "Attendance requirement not met"
        : !lessonsPassed
        ? "Lessons not completed"
        : null,
    },
  };
};
