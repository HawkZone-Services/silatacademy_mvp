import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Player from "../models/Player.js";
import Notification from "../models/Notification.js";
import { assertObjectId, httpError, toObjectId } from "../utils/validation.js";
import { getDb } from "../utils/mongodb.js";
import Program from "../models/Program.js";
import {
  getAttendanceSummary,
  hasMinimumAttendance,
  getPlayerForUser,
  mapLessonEligibility,
  lessonCompletionForBelt as computeLessonCompletionForBelt,
} from "../services/eligibilityService.js";
const computeQuizScore = (lesson, answers = []) => {
  if (!lesson?.quiz?.length) return { score: 0, answers: [] };

  const normalized = answers.map((ans, idx) => ({
    questionIndex:
      typeof ans.questionIndex === "number" ? ans.questionIndex : idx,
    selectedIndex:
      typeof ans.selectedIndex === "number" ? ans.selectedIndex : null,
  }));

  let correctCount = 0;
  const computedAnswers = normalized.map((ans) => {
    const question = lesson.quiz?.[ans.questionIndex];
    if (!question) return { ...ans, correct: false };
    const correct =
      typeof ans.selectedIndex === "number" &&
      ans.selectedIndex === question.correctIndex;
    if (correct) correctCount += 1;
    return { ...ans, correct };
  });

  const score = Math.round((correctCount / lesson.quiz.length) * 100);
  return { score, answers: computedAnswers };
};

export const createLesson = asyncHandler(async (req, res) => {
  const db = await getDb();
  const {
    title,
    summary,
    videoUrl,
    content,
    technicalContent,
    medicalContent,
    psychologyContent,
    resources = [],
    durationMinutes,
    moduleId,
    programId,
    quiz = [],
    order,
  } = req.body;

  if (!title) throw httpError(400, "title is required");

  const lessonDoc = {
    title,
    summary,
    videoUrl,
    content,
    technicalContent,
    medicalContent,
    psychologyContent,
    resources,
    durationMinutes,
    module: toObjectId(moduleId),
    program: toObjectId(programId),
    quiz,
    order,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("lessons").insertOne(lessonDoc);

  if (lessonDoc.module) {
    await db
      .collection("modules")
      .updateOne(
        { _id: new ObjectId(lessonDoc.module) },
        { $addToSet: { lessons: result.insertedId } }
      );
  }

  res
    .status(201)
    .json({ success: true, lesson: { ...lessonDoc, _id: result.insertedId } });
});

export const listLessons = asyncHandler(async (req, res) => {
  const db = await getDb();
  const moduleId = toObjectId(req.query.moduleId);
  const programId = toObjectId(req.query.programId);
  const userId = toObjectId(req.user?._id);

  const filter = {};
  if (moduleId) filter.module = moduleId;
  if (programId) filter.program = programId;

  const lessons = await db
    .collection("lessons")
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "module",
        },
      },
      { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "programs",
          localField: "program",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
      ...(userId
        ? [
            {
              $lookup: {
                from: "lessonprogresses",
                let: { lessonId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$lesson", "$$lessonId"] },
                          { $eq: ["$user", userId] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "progress",
              },
            },
            {
              $unwind: { path: "$progress", preserveNullAndEmptyArrays: true },
            },
          ]
        : []),
      { $sort: { order: 1, createdAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, lessons });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.id, "lessonId");

  const deleted = await Lesson.findByIdAndDelete(lessonId);
  if (!deleted) throw httpError(404, "Lesson not found"); // 404 if lesson doesn't exist

  res.json({ success: true, message: "Lesson deleted successfully" });
});
export const getLesson = asyncHandler(async (req, res) => {
  const db = await getDb();
  const lessonId = assertObjectId(req.params.id, "lessonId");
  const userId = toObjectId(req.user?._id);

  const [lesson] = await db
    .collection("lessons")
    .aggregate([
      { $match: { _id: lessonId } },
      ...(userId
        ? [
            {
              $lookup: {
                from: "lessonprogresses",
                let: { lessonId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$lesson", "$$lessonId"] },
                          { $eq: ["$user", userId] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "progress",
              },
            },
            {
              $unwind: { path: "$progress", preserveNullAndEmptyArrays: true },
            },
          ]
        : []),
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "module",
        },
      },
      { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } },
    ])
    .toArray();

  if (!lesson) throw httpError(404, "Lesson not found");

  res.json({ success: true, lesson });
});

export const saveProgress = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.id, "lessonId");
  const userId = assertObjectId(req.user?._id, "userId");

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const { positionSeconds = 0, completed = false, quizAnswers = [] } = req.body;
  const { score, answers } = computeQuizScore(lesson, quizAnswers);

  const existing = await LessonProgress.findOne({
    lesson: lessonId,
    user: userId,
  });

  const update = {
    positionSeconds,
    completed: completed || score === 100,
    quizScore: score,
    quizAnswers: answers,
    lastVisitedAt: new Date(),
    updatedAt: new Date(),
  };

  const progress = await LessonProgress.findOneAndUpdate(
    { lesson: lessonId, user: userId },
    {
      $set: update,
      $setOnInsert: { lesson: lessonId, user: userId, createdAt: new Date() },
    },
    { upsert: true, new: true }
  );

  if (progress.completed && !existing?.completed) {
    await Notification.create({
      user: userId,
      title: "Lesson Completed",
      message: `You completed: ${lesson.title}`,
      type: "lesson",
    });

    const player = await Player.findOne({ user: userId });
    if (player) {
      const status = await computeLessonCompletionForBelt(
        userId,
        player.beltLevel
      );
      if (status.total > 0 && status.completed >= status.total) {
        await Notification.create({
          user: userId,
          title: "Exams Unlocked",
          message: "You unlocked exams for your belt level.",
          type: "exam",
        });
      }
    }
  }

  res.json({ success: true, progress });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.id, "lessonId");
  const payload = { ...req.body, updatedAt: new Date() };

  const updated = await Lesson.findByIdAndUpdate(lessonId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw httpError(404, "Lesson not found");

  res.json({ success: true, lesson: updated });
});

// ===============================
// STUDENT LESSON ENGINE
// ===============================

// Helper: رجّع player المرتبط بالـ user
const mapLessonForStudent = (lesson, progressMap, prereqSet, attendanceOK) => {
  const base = mapLessonEligibility(lesson, {
    progressMap,
    prereqSet,
    attendanceOK,
  });

  return {
    ...base,
    programLevel:
      lesson.programLevel || lesson.program?.level || base.level || null,
    beltLevel: lesson.beltLevel || base.level || null,
  };
};

/* =====================================================
   GET AVAILABLE LESSONS FOR STUDENT
   GET /api/lessons/student/available
===================================================== */
export const getStudentAvailableLessons = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) throw httpError(401, "Unauthorized");

  const player = await getPlayerForUser(userId);
  if (!player) throw httpError(404, "Player profile not found");

  // 1) Attendance
  const attendanceSummary = await getAttendanceSummary(player._id);
  const attendanceOK = hasMinimumAttendance(attendanceSummary);

  // 2) Fetch lessons التابعة لبرنامج مستوى الطالب (لو حابب تربط بالمستوى)
  // هنا بنجيب كل الدروس المنشورة، ممكن تضيف فلتر حسب beltLevel / program.level
  const lessons = await Lesson.find({ isPublished: true }).sort({
    program: 1,
    module: 1,
    order: 1,
    createdAt: 1,
  });

  // 3) Fetch progress لكل الدروس
  const lessonIds = lessons.map((l) => l._id);
  const progresses = await LessonProgress.find({
    user: userId,
    lesson: { $in: lessonIds },
  });

  const progressMap = new Map();
  const prereqSet = new Set();

  progresses.forEach((p) => {
    progressMap.set(p.lesson.toString(), p);
    if (p.completed) {
      prereqSet.add(p.lesson.toString());
    }
  });

  const items = lessons.map((lesson) =>
    mapLessonForStudent(lesson, progressMap, prereqSet, attendanceOK)
  );

  res.json({
    success: true,
    data: {
      attendance: attendanceSummary,
      lessons: items,
    },
  });
});

/* =====================================================
   GET LESSON PROGRESS SUMMARY (STUDENT)
   GET /api/lessons/student/progress
===================================================== */
export const getStudentLessonProgress = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const [lessons, progresses, programs] = await Promise.all([
    Lesson.find({ isPublished: true }).select(
      "_id program module beltLevel level"
    ),
    LessonProgress.find({ user: userId }),
    Program.find().select("_id title level"),
  ]);

  const progressMap = new Map();
  progresses.forEach((p) => {
    progressMap.set(p.lesson.toString(), p);
  });

  const perProgram = {};
  const overall = {
    totalLessons: lessons.length,
    completedLessons: 0,
  };

  lessons.forEach((l) => {
    const key = l.program ? l.program.toString() : "unassigned";
    if (!perProgram[key]) {
      const programMeta = programs.find((p) => p._id.toString() === key);
      perProgram[key] = {
        programId: l.program || null,
        title: programMeta?.title || "General",
        level: programMeta?.level || l.level || l.beltLevel || null,
        totalLessons: 0,
        completedLessons: 0,
      };
    }

    perProgram[key].totalLessons += 1;

    const prg = progressMap.get(l._id.toString());
    if (prg?.completed) {
      perProgram[key].completedLessons += 1;
      overall.completedLessons += 1;
    }
  });

  res.json({
    success: true,
    overall: {
      totalLessons: overall.totalLessons,
      completedLessons: overall.completedLessons,
      completionRate:
        overall.totalLessons > 0
          ? Math.round((overall.completedLessons / overall.totalLessons) * 100)
          : 0,
    },
    programs: Object.values(perProgram).map((p) => ({
      ...p,
      completionRate:
        p.totalLessons > 0
          ? Math.round((p.completedLessons / p.totalLessons) * 100)
          : 0,
    })),
  });
});

/* =====================================================
   COMPLETE LESSON + QUIZ RESULT (STUDENT)
   POST /api/lessons/student/:lessonId/complete
===================================================== */
export const completeStudentLesson = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const lessonId = assertObjectId(req.params.lessonId, "lessonId");
  const { quizScore, quizMax, passed } = req.body || {};

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const now = new Date();

  const update = {
    user: userId,
    lesson: lessonId,
    completed: passed !== false, // لو حابب تخليه false عند الرسوب
    quizScore: typeof quizScore === "number" ? quizScore : undefined,
    quizMax: typeof quizMax === "number" ? quizMax : undefined,
    lastAccessedAt: now,
    updatedAt: now,
  };

  const progress = await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    {
      $set: update,
      $inc: { attempts: 1 },
      $setOnInsert: { createdAt: now },
    },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: "Lesson progress updated",
    progress,
  });
});

/* =====================================================
   LESSON QUIZ ENDPOINTS
===================================================== */
export const getLessonQuiz = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.lessonId, "lessonId");
  const lesson = await Lesson.findById(lessonId).select("quiz title");
  if (!lesson) throw httpError(404, "Lesson not found");

  res.json({
    success: true,
    data: {
      quiz: {
        title: lesson.title,
        questions: lesson.quiz || [],
      },
    },
  });
});

export const submitLessonQuiz = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");
  const lessonId = assertObjectId(req.params.lessonId, "lessonId");
  const { answers = [] } = req.body || {};

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const { score, answers: computed } = computeQuizScore(lesson, answers);
  const passed = score >= 60;
  const now = new Date();

  const progress = await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    {
      $set: {
        user: userId,
        lesson: lessonId,
        quizAnswers: computed,
        quizScore: score,
        quizMax: 100,
        completed: passed,
        lastAccessedAt: now,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    data: { score, passed, progress },
  });
});
