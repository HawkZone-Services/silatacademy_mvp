import asyncHandler from "express-async-handler";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Player from "../models/Player.js";
import Notification from "../models/Notification.js";
import Program from "../models/Program.js";

import { assertObjectId, httpError, toObjectId } from "../utils/validation.js";

import {
  getAttendanceSummary,
  hasMinimumAttendance,
  getPlayerForUser,
  mapLessonEligibility,
  lessonCompletionForBelt as computeLessonCompletionForBelt,
} from "../services/eligibilityService.js";

/* =====================================================
   QUIZ SCORING
===================================================== */
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
    const q = lesson.quiz[ans.questionIndex];
    if (!q) return { ...ans, correct: false };

    const correct =
      typeof ans.selectedIndex === "number" &&
      ans.selectedIndex === q.correctIndex;

    if (correct) correctCount++;

    return { ...ans, correct };
  });

  const score = Math.round((correctCount / lesson.quiz.length) * 100);

  return { score, answers: computedAnswers };
};

/* =====================================================
   CREATE LESSON
===================================================== */
export const createLesson = asyncHandler(async (req, res) => {
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
    order = 0,
  } = req.body;

  if (!title) throw httpError(400, "title is required");

  const lesson = await Lesson.create({
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
  });

  res.status(201).json({
    success: true,
    lesson,
  });
});

/* =====================================================
   LIST LESSONS (with optional progress)
===================================================== */
export const listLessons = asyncHandler(async (req, res) => {
  const moduleId = req.query.moduleId ? toObjectId(req.query.moduleId) : null;
  const programId = req.query.programId
    ? toObjectId(req.query.programId)
    : null;
  const userId = req.user?._id ? toObjectId(req.user?._id) : null;

  const filter = {};
  if (moduleId) filter.module = moduleId;
  if (programId) filter.program = programId;

  const lessons = await Lesson.find(filter)
    .populate("module", "title")
    .populate("program", "title level")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  if (!userId) {
    return res.json({ success: true, lessons });
  }

  const lessonIds = lessons.map((l) => l._id);
  const progresses = await LessonProgress.find({
    lesson: { $in: lessonIds },
    user: userId,
  }).lean();

  const map = new Map();
  progresses.forEach((p) => map.set(p.lesson.toString(), p));

  const enriched = lessons.map((l) => ({
    ...l,
    progress: map.get(l._id.toString()) || null,
  }));

  res.json({ success: true, lessons: enriched });
});

/* =====================================================
   GET SINGLE LESSON (supports both admin/student routes)
===================================================== */
export const getLesson = asyncHandler(async (req, res) => {
  const lessonIdRaw = req.params.lessonId || req.params.id;

  if (!lessonIdRaw) throw httpError(400, "Lesson ID is required");

  const lessonId = assertObjectId(lessonIdRaw, "lessonId");
  const userId = req.user?._id;

  const lesson = await Lesson.findById(lessonId)
    .populate("module", "title")
    .populate("program", "title level")
    .lean();

  if (!lesson) throw httpError(404, "Lesson not found");

  let progress = null;
  if (userId) {
    progress = await LessonProgress.findOne({
      lesson: lessonId,
      user: userId,
    }).lean();
  }

  return res.json({
    success: true,
    lesson,
    progress,
  });
});

/* =====================================================
   DELETE LESSON
===================================================== */
export const deleteLesson = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.id);

  const deleted = await Lesson.findByIdAndDelete(lessonId);
  if (!deleted) throw httpError(404, "Lesson not found");

  res.json({
    success: true,
    message: "Lesson deleted successfully",
  });
});

/* =====================================================
   UPDATE LESSON
===================================================== */
export const updateLesson = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.id);

  const updated = await Lesson.findByIdAndUpdate(
    lessonId,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!updated) throw httpError(404, "Lesson not found");

  res.json({ success: true, lesson: updated });
});

/* =====================================================
   SAVE PROGRESS
===================================================== */
export const saveProgress = asyncHandler(async (req, res) => {
  const lessonIdRaw = req.params.lessonId || req.params.id;
  const lessonId = assertObjectId(lessonIdRaw, "lessonId");

  const userId = assertObjectId(req.user._id);

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const { positionSeconds = 0, completed = false, quizAnswers = [] } = req.body;

  const { score, answers } = computeQuizScore(lesson, quizAnswers);

  const existing = await LessonProgress.findOne({
    lesson: lessonId,
    user: userId,
  });

  const progress = await LessonProgress.findOneAndUpdate(
    { lesson: lessonId, user: userId },
    {
      $set: {
        positionSeconds,
        completed: completed || score === 100,
        quizScore: score,
        quizAnswers: answers,
        lastVisitedAt: new Date(),
      },
      $setOnInsert: {
        lesson: lessonId,
        user: userId,
        createdAt: new Date(),
      },
    },
    { new: true, upsert: true }
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

/* =====================================================
   STUDENT AVAILABLE LESSONS
===================================================== */
export const getStudentAvailableLessons = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const player = await getPlayerForUser(userId);
  if (!player) throw httpError(404, "Player profile not found");

  // 1) attendance logic
  const attendanceSummary = await getAttendanceSummary(player._id);
  const attendanceCount = attendanceSummary?.total || 0;

  // 🔥 Unlock 3 lessons per every 5 attendance
  const lessonsUnlocked = Math.floor(attendanceCount / 5) * 3;

  // 2) get all lessons in order
  const lessons = await Lesson.find({ isActive: true })
    .populate("program", "title level")
    .populate("module", "title")
    .sort({ program: 1, module: 1, order: 1, createdAt: 1 })
    .lean();

  // 3) get progress map
  const lessonIds = lessons.map((l) => l._id);
  const progresses = await LessonProgress.find({
    user: userId,
    lesson: { $in: lessonIds },
  }).lean();

  const progressMap = new Map();
  progresses.forEach((p) => {
    progressMap.set(p.lesson.toString(), p);
  });

  // 4) apply unlock logic
  const formatted = lessons.map((lesson, index) => {
    const unlocked = index < lessonsUnlocked;

    const progress = progressMap.get(lesson._id.toString());
    const isCompleted = progress?.completed || false;

    return {
      ...lesson,
      unlocked,
      locked: !unlocked,
      lockedReason: !unlocked
        ? `Requires more attendance. Need ${
            Math.ceil((index + 1) / 3) * 5
          } attendances.`
        : null,
      progress,
      completed: isCompleted,
    };
  });

  res.json({
    success: true,
    data: {
      attendance: attendanceSummary,
      lessonsUnlocked,
      lessons: formatted,
    },
  });
});

/* =====================================================
   STUDENT LESSON PROGRESS SUMMARY
===================================================== */
export const getStudentLessonProgress = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const [lessons, progresses, programs] = await Promise.all([
    Lesson.find({ isActive: true }).select("_id program module"),
    LessonProgress.find({ user: userId }),
    Program.find().select("_id title level"),
  ]);

  const progressMap = new Map();
  progresses.forEach((p) => progressMap.set(p.lesson.toString(), p));

  const perProgram = {};
  const overall = { totalLessons: lessons.length, completedLessons: 0 };

  lessons.forEach((l) => {
    const key = l.program ? l.program.toString() : "unassigned";
    if (!perProgram[key]) {
      const meta = programs.find((p) => p._id.toString() === key);
      perProgram[key] = {
        programId: l.program || null,
        title: meta?.title || "General",
        level: meta?.level || null,
        totalLessons: 0,
        completedLessons: 0,
      };
    }

    perProgram[key].totalLessons++;
    if (progressMap.get(l._id.toString())?.completed) {
      perProgram[key].completedLessons++;
      overall.completedLessons++;
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
   GET LESSON QUIZ
===================================================== */
export const getLessonQuiz = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.lessonId, "lessonId");
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw httpError(404, "Lesson not found");

  res.json({
    success: true,
    data: {
      quiz: lesson.quiz || [],
      lessonTitle: lesson.title,
    },
  });
});

/* =====================================================
   SUBMIT QUIZ
===================================================== */
export const submitLessonQuiz = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const lessonId = assertObjectId(req.params.lessonId);
  const { answers = [] } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const { score, answers: computed } = computeQuizScore(lesson, answers);

  const now = new Date();
  const passed = score >= 60;

  const progress = await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    {
      $set: {
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

/* =====================================================
   COMPLETE LESSON
===================================================== */
export const completeStudentLesson = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const lessonId = assertObjectId(req.params.lessonId);

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const progress = await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    {
      $set: {
        completed: true,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    data: { progress },
  });
});
