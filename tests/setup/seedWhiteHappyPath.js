import {
  baseUsersAndPlayer,
  baseProgramAndModules,
  baseLessons,
  completeLesson,
  createExamAndRegistration,
} from "./seedUtils.js";

import Attendance from "../../models/Attendance.js";
import BeltRanking from "../../models/BeltRanking.js";
import FinalExamResult from "../../models/FinalExamResult.js";
import BeltHistory from "../../models/BeltHistory.js";

export async function seedWhiteHappyPath() {
  const { student, instructor, player, tokens } = await baseUsersAndPlayer(
    "white"
  );

  const { program, modules } = await baseProgramAndModules("white");
  const lessons = await baseLessons(program, modules);

  // ✅ Complete all lessons
  await completeLesson(student._id, lessons.A);
  await completeLesson(student._id, lessons.B);
  await completeLesson(student._id, lessons.P);

  // ✅ Attendance OK
  await BeltRanking.create({
    name: "white",
    order: 0,
    attendance: { requiredSessions: 5, minRate: 50 },
  });

  await Attendance.insertMany(
    Array.from({ length: 5 }).map(() => ({
      player: player._id,
      status: "present",
      date: new Date(),
    }))
  );

  // Exam
  const { exam } = await createExamAndRegistration(player._id, "white");

  // Final result passed
  await FinalExamResult.create({
    exam: exam._id,
    student: student._id,
    passed: true,
    totalScore: 30,
  });

  // Belt history pending
  const history = await BeltHistory.create({
    player: player._id,
    fromBelt: "white",
    toBelt: "yellow",
    status: "pending",
    examId: exam._id,
  });

  return {
    tokens,
    ids: {
      studentId: student._id,
      instructorId: instructor._id,
      playerId: player._id,
      examId: exam._id,
      beltHistoryId: history._id,
    },
  };
}
