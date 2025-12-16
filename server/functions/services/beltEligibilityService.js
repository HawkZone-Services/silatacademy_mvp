import Attendance from "../models/Attendance.js";
import BeltRanking from "../models/BeltRanking.js";
import Player from "../models/Player.js";

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
