import Attendance from "../../models/Attendance.js";
import Player from "../../models/Player.js";
import BeltRanking from "../../models/BeltRanking.js";
import { httpError } from "../../utils/validation.js";

export const getAttendanceEligibilityForBelt = async ({
  userId,
  beltLevel,
}) => {
  if (!userId) throw httpError(401, "Unauthorized");
  if (!beltLevel) throw httpError(400, "beltLevel is required");

  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found");

  if (player.beltLevel.toLowerCase() !== beltLevel.toLowerCase()) {
    throw httpError(403, "BELT_MISMATCH");
  }

  const [total, present] = await Promise.all([
    Attendance.countDocuments({ player: player._id, beltLevel }),
    Attendance.countDocuments({
      player: player._id,
      beltLevel,
      status: "present",
    }),
  ]);

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const beltConfig = await BeltRanking.findOne({
    name: new RegExp(`^${beltLevel}$`, "i"),
  }).lean();

  const requiredSessions = beltConfig?.attendance?.requiredSessions || 0;
  const minRate = beltConfig?.attendance?.minRate || 0;

  return {
    beltLevel,
    total,
    present,
    rate,
    requiredSessions,
    minRate,
    eligible: present >= requiredSessions && rate >= minRate,
  };
};
