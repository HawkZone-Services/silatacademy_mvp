import {
  baseUsersAndPlayer,
  baseProgramAndModules,
  baseLessons,
  completeLesson,
  createExamAndRegistration,
} from "./seedUtils.js";
import Attendance from "../../models/Attendance.js";
import BeltRanking from "../../models/BeltRanking.js";

export async function seedWhiteFailAttendance() {
  const { student, player, tokens } = await baseUsersAndPlayer("white");

  const { program, modules } = await baseProgramAndModules("white");
  const lessons = await baseLessons(program, modules);

  // ✅ Complete all lessons A/B/P
  await completeLesson(student._id, lessons.A);
  await completeLesson(student._id, lessons.B);
  await completeLesson(student._id, lessons.P);

  // ❌ Attendance NOT enough
  await BeltRanking.create({
    name: "white",
    order: 0,
    attendance: { requiredSessions: 5, minRate: 50 },
  });

  await Attendance.insertMany([
    { player: player._id, status: "present", date: new Date() },
    { player: player._id, status: "absent", date: new Date() },
  ]);

  const { exam } = await createExamAndRegistration(player._id, "white");

  return {
    tokens,
    ids: {
      studentId: student._id,
      playerId: player._id,
      examId: exam._id,
    },
  };
}
