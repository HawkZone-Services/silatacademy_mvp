import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";
import Player from "../../models/Player.js";
import Program from "../../models/Program.js";
import Module from "../../models/Module.js";
import Lesson from "../../models/Lesson.js";
import LessonProgress from "../../models/LessonProgress.js";
import BeltRanking from "../../models/BeltRanking.js";
import Attendance from "../../models/Attendance.js";

import Exam from "../../models/Exam.js";
import ExamRegistration from "../../models/ExamRegistration.js";
import FinalExamResult from "../../models/FinalExamResult.js";
import BeltHistory from "../../models/BeltHistory.js";

const signToken = (userId) =>
  jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: "1h" });

const hash = (pw) => bcrypt.hashSync(pw, 10);

export async function seedWhiteFailPIncomplete() {
  // Users
  const admin = await User.create({
    name: "Admin",
    nationalId: "90000000000001",
    passwordHash: hash("pass"),
    gender: "male",
    role: "admin",
  });

  const instructor = await User.create({
    name: "Instructor",
    nationalId: "90000000000002",
    passwordHash: hash("pass"),
    gender: "male",
    role: "instructor",
  });

  const student = await User.create({
    name: "Student",
    nationalId: "90000000000003",
    passwordHash: hash("pass"),
    gender: "male",
    role: "student",
  });

  const studentToken = signToken(student._id);
  const instructorToken = signToken(instructor._id);
  const adminToken = signToken(admin._id);

  // Player
  const player = await Player.create({
    user: student._id,
    beltLevel: "white",
  });

  // Program
  const program = await Program.create({ title: "Beginner" });

  // BeltRanking (attendance rules)
  await BeltRanking.create({
    name: "white",
    order: 0,
    attendance: { requiredSessions: 5, minRate: 50 },
  });

  // Attendance OK: 5 present
  await Attendance.insertMany(
    Array.from({ length: 5 }).map(() => ({
      player: player._id,
      status: "present",
      date: new Date(),
    }))
  );

  // Modules (requires Module schema updated with beltLevel/moduleType)
  const modA = await Module.create({
    program: program._id,
    title: "White A",
    beltLevel: "white",
    moduleType: "A",
  });

  const modB = await Module.create({
    program: program._id,
    title: "White B",
    beltLevel: "white",
    moduleType: "B",
  });

  const modP = await Module.create({
    program: program._id,
    title: "White P",
    beltLevel: "white",
    moduleType: "P",
  });

  // Lessons
  const lessonA = await Lesson.create({
    program: program._id,
    module: modA._id,
    title: "A1",
    order: 1,
    quiz: [{ text: "Q1", choices: ["a", "b"], correctIndex: 0 }],
  });

  const lessonB = await Lesson.create({
    program: program._id,
    module: modB._id,
    title: "B1",
    order: 1,
    quiz: [{ text: "Q1", choices: ["a", "b"], correctIndex: 0 }],
  });

  const lessonP = await Lesson.create({
    program: program._id,
    module: modP._id,
    title: "P1",
    order: 1,
    quiz: [{ text: "Q1", choices: ["a", "b"], correctIndex: 0 }],
  });

  // attach lessons to modules (optional)
  await Module.updateMany(
    { _id: { $in: [modA._id, modB._id, modP._id] } },
    { $set: { lessons: [] } }
  );
  await Module.updateOne(
    { _id: modA._id },
    { $set: { lessons: [lessonA._id] } }
  );
  await Module.updateOne(
    { _id: modB._id },
    { $set: { lessons: [lessonB._id] } }
  );
  await Module.updateOne(
    { _id: modP._id },
    { $set: { lessons: [lessonP._id] } }
  );

  // Progress: A & B completed, P NOT completed
  await LessonProgress.create({
    user: student._id,
    lesson: lessonA._id,
    beltLevel: "white",
    completed: true,
    lessonState: "completed",
    videoCompleted: true,
    pdfCompleted: true,
    drillCompleted: true,
    safetyCompleted: true,
    quickCheckPassed: true,
    quickCheckScore: 80,
  });

  await LessonProgress.create({
    user: student._id,
    lesson: lessonB._id,
    beltLevel: "white",
    completed: true,
    lessonState: "completed",
    videoCompleted: true,
    pdfCompleted: true,
    drillCompleted: true,
    safetyCompleted: true,
    quickCheckPassed: true,
    quickCheckScore: 80,
  });

  await LessonProgress.create({
    user: student._id,
    lesson: lessonP._id,
    beltLevel: "white",
    completed: false,
    lessonState: "quiz_passed",
    videoCompleted: true,
    pdfCompleted: true,
    drillCompleted: true,
    safetyCompleted: true,
    quickCheckPassed: true,
    quickCheckScore: 80,
  });

  // Exam + registration approved
  const exam = await Exam.create({
    title: "White Exam",
    beltLevel: "white",
    status: "published",
    passMark: 24,
    maxTheoryScore: 40,
    questions: [
      {
        text: "Q1",
        type: "mcq",
        choices: ["a", "b"],
        correctIndex: 0,
        maxScore: 1,
      },
    ],
  });

  await ExamRegistration.create({
    exam: exam._id,
    player: player._id,
    status: "approved",
  });

  return {
    ids: {
      adminId: admin._id,
      instructorId: instructor._id,
      studentId: student._id,
      playerId: player._id,
      examId: exam._id,
    },
    tokens: { adminToken, instructorToken, studentToken },
  };
}
