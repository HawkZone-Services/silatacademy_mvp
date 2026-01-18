import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";
import Player from "../../models/Player.js";
import Program from "../../models/Program.js";
import Module from "../../models/Module.js";
import Lesson from "../../models/Lesson.js";
import LessonProgress from "../../models/LessonProgress.js";
import Exam from "../../models/Exam.js";
import ExamRegistration from "../../models/ExamRegistration.js";

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */

const hash = (pw = "pass") => bcrypt.hashSync(pw, 10);

const signToken = (userId) =>
  jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

/* ------------------------------------------------------------------
   Base Users + Player
------------------------------------------------------------------- */

export async function baseUsersAndPlayer(beltLevel = "white") {
  const admin = await User.create({
    name: "Admin",
    nationalId: `900000000000-${Math.random()}`,
    passwordHash: hash(),
    gender: "male",
    role: "admin",
  });

  const instructor = await User.create({
    name: "Instructor",
    nationalId: `900000000001-${Math.random()}`,
    passwordHash: hash(),
    gender: "male",
    role: "instructor",
  });

  const student = await User.create({
    name: "Student",
    nationalId: `900000000002-${Math.random()}`,
    passwordHash: hash(),
    gender: "male",
    role: "student",
  });

  const player = await Player.create({
    user: student._id,
    beltLevel,
  });

  return {
    admin,
    instructor,
    student,
    player,
    tokens: {
      adminToken: signToken(admin._id),
      instructorToken: signToken(instructor._id),
      studentToken: signToken(student._id),
    },
  };
}

/* ------------------------------------------------------------------
   Program + Modules (A/B/P/E)
------------------------------------------------------------------- */

export async function baseProgramAndModules(beltLevel = "white") {
  const program = await Program.create({
    title: "Beginner Program",
  });

  const modules = {
    A: await Module.create({
      program: program._id,
      title: `${beltLevel} Anatomy`,
      beltLevel,
      moduleType: "A",
    }),
    B: await Module.create({
      program: program._id,
      title: `${beltLevel} Behavior`,
      beltLevel,
      moduleType: "B",
    }),
    P: await Module.create({
      program: program._id,
      title: `${beltLevel} Physical`,
      beltLevel,
      moduleType: "P",
    }),
    E: await Module.create({
      program: program._id,
      title: `${beltLevel} Exam`,
      beltLevel,
      moduleType: "E",
    }),
  };

  return { program, modules };
}

/* ------------------------------------------------------------------
   Lessons per Module
------------------------------------------------------------------- */

export async function baseLessons(program, modules) {
  const lessonA = await Lesson.create({
    program: program._id,
    module: modules.A._id,
    title: "A1 - Anatomy Basics",
    order: 1,
    quiz: [{ text: "A?", choices: ["yes", "no"], correctIndex: 0 }],
  });

  const lessonB = await Lesson.create({
    program: program._id,
    module: modules.B._id,
    title: "B1 - Ethics",
    order: 1,
    quiz: [{ text: "B?", choices: ["yes", "no"], correctIndex: 0 }],
  });

  const lessonP = await Lesson.create({
    program: program._id,
    module: modules.P._id,
    title: "P1 - Practice",
    order: 1,
    quiz: [{ text: "P?", choices: ["yes", "no"], correctIndex: 0 }],
  });

  // attach lessons to modules
  await Module.updateOne(
    { _id: modules.A._id },
    { $set: { lessons: [lessonA._id] } }
  );
  await Module.updateOne(
    { _id: modules.B._id },
    { $set: { lessons: [lessonB._id] } }
  );
  await Module.updateOne(
    { _id: modules.P._id },
    { $set: { lessons: [lessonP._id] } }
  );

  return {
    A: lessonA,
    B: lessonB,
    P: lessonP,
  };
}

/* ------------------------------------------------------------------
   Complete Lesson Helper
------------------------------------------------------------------- */

export async function completeLesson(userId, lesson) {
  return LessonProgress.create({
    user: userId,
    lesson: lesson._id,
    beltLevel: "white",
    completed: true,
    lessonState: "completed",
    videoCompleted: true,
    pdfCompleted: true,
    drillCompleted: true,
    safetyCompleted: true,
    quickCheckPassed: true,
    quickCheckScore: 80,
    assignmentRequired: false,
  });
}

/* ------------------------------------------------------------------
   Exam + Registration
------------------------------------------------------------------- */

export async function createExamAndRegistration(playerId, beltLevel = "white") {
  const exam = await Exam.create({
    title: `${beltLevel} Belt Exam`,
    beltLevel,
    status: "published",
    passMark: 24,
    maxTheoryScore: 40,
    questions: [
      {
        text: "Exam Q?",
        type: "mcq",
        choices: ["yes", "no"],
        correctIndex: 0,
        maxScore: 1,
      },
    ],
  });

  await ExamRegistration.create({
    exam: exam._id,
    player: playerId,
    status: "approved",
  });

  return { exam };
}
