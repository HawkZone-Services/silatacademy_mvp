import Attendance from "../../models/Attendance.js";
import Player from "../../models/Player.js";
import { httpError } from "../../utils/validation.js";

export const upsertAttendanceMark = async ({
  markerUserId,
  studentUserId,
  beltLevel,
  sessionDate,
  status = "present",
  note = "",
}) => {
  if (!markerUserId) throw httpError(401, "Unauthorized");
  if (!studentUserId || !beltLevel || !sessionDate) {
    throw httpError(400, "studentUserId, beltLevel, sessionDate are required");
  }

  const player = await Player.findOne({ user: studentUserId });
  if (!player) throw httpError(404, "Player not found");

  if (player.beltLevel.toLowerCase() !== beltLevel.toLowerCase()) {
    throw httpError(403, "BELT_MISMATCH");
  }

  const date = new Date(sessionDate);

  const attendance = await Attendance.findOneAndUpdate(
    { player: player._id, beltLevel, sessionDate: date },
    {
      $set: {
        player: player._id,
        beltLevel,
        sessionDate: date,
        status,
        note,
        markedBy: markerUserId,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { new: true, upsert: true },
  );

  return attendance;
};

export const listAttendanceByPlayerAndBelt = async ({
  playerId,
  beltLevel,
}) => {
  if (!playerId || !beltLevel) {
    throw httpError(400, "playerId and beltLevel are required");
  }

  return Attendance.find({ player: playerId, beltLevel })
    .sort({ sessionDate: -1 })
    .lean();
};

export const listMyAttendanceByBelt = async ({ userId, beltLevel }) => {
  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found");

  return listAttendanceByPlayerAndBelt({
    playerId: player._id,
    beltLevel,
  });
};
