import Attendance from "../models/Attendance.js";
import LessonProgress from "../models/LessonProgress.js";
import BeltRanking from "../models/BeltRanking.js";

export const computeBeltProgress = async (player) => {
  const belt = await BeltRanking.findOne({ name: player.beltLabel });
  if (!belt) return null;

  // Attendance
  const totalAttendance = await Attendance.countDocuments({
    player: player._id,
  });

  const presentAttendance = await Attendance.countDocuments({
    player: player._id,
    status: "present",
  });

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100)
      : 0;

  // Lessons
  const lessonsCompleted = await LessonProgress.countDocuments({
    user: player.user,
    completed: true,
  });

  return {
    belt: belt.name,
    level: belt.level,

    attendance: {
      attended: presentAttendance,
      required: belt.attendance.requiredSessions,
      rate: attendanceRate,
      minRate: belt.attendance.minRate,
      passed:
        attendanceRate >= belt.attendance.minRate &&
        presentAttendance >= belt.attendance.requiredSessions,
    },

    lessons: {
      completed: lessonsCompleted,
      required: belt.lessons.totalLessons,
      passed: lessonsCompleted >= belt.lessons.totalLessons,
    },

    eligibleForExam: false, // نحسبها في الخطوة الجاية
  };
};
