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
import { getMyBeltProgress } from "../services/beltProgressService.js";
import BeltRanking from "../models/BeltRanking.js";

/* =====================================================
   QUIZ SCORING
===================================================== */
const computeQuizScore = (lesson, answers = []) => {
  if (!lesson?.quiz?.length) return { score: 0, answers: [] };

  let correct = 0;

  const computedAnswers = answers.map((ans, idx) => {
    const q = lesson.quiz[idx];
    const isCorrect =
      q && typeof ans.selectedIndex === "number"
        ? ans.selectedIndex === q.correctIndex
        : false;

    if (isCorrect) correct++;

    return {
      questionIndex: idx,
      selectedIndex: ans.selectedIndex ?? null,
      correct: isCorrect,
    };
  });

  const score = Math.round((correct / lesson.quiz.length) * 100);
  return { score, answers: computedAnswers };
};

/* =========================
   Helpers
========================= */
const normalizeBeltName = (belt = "") =>
  belt.toLowerCase().replace(" belt", "").trim();

/* =====================================================
   CREATE LESSON
===================================================== */
export const createLesson = asyncHandler(async (req, res) => {
  const {
    title,
    moduleId,
    programId,
    order = 0,
    quiz = [],
    ...rest
  } = req.body;
  if (!title) throw httpError(400, "title is required");

  const lesson = await Lesson.create({
    title,
    ...rest,
    quiz,
    order,
    module: toObjectId(moduleId),
    program: toObjectId(programId),
  });

  res.status(201).json({ success: true, lesson });
});
/* =====================================================
   LIST LESSONS (ADMIN / OPTIONAL PROGRESS)
===================================================== */
export const listLessons = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const lessons = await Lesson.find({})
    .populate("module", "title")
    .populate("program", "title level")
    .sort({ order: 1 })
    .lean();

  if (!userId) {
    return res.json({ success: true, lessons });
  }

  const progresses = await LessonProgress.find({ user: userId }).lean();
  const map = new Map(progresses.map((p) => [p.lesson.toString(), p]));

  const enriched = lessons.map((l) => ({
    ...l,
    progress: map.get(l._id.toString()) || null,
  }));

  res.json({ success: true, lessons: enriched });
});

/* =====================================================
   GET SINGLE LESSON (LOCKED-AWARE)
===================================================== */
export const getLesson = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.lessonId || req.params.id);
  const userId = req.user?._id;

  const lesson = await Lesson.findById(lessonId)
    .populate("module", "title")
    .populate("program", "title level")
    .lean();

  if (!lesson) throw httpError(404, "Lesson not found");

  if (!userId) {
    return res.json({
      success: true,
      lesson: { _id: lesson._id, title: lesson.title, locked: true },
    });
  }

  const beltProgress = await getMyBeltProgress(userId);
  const unlockedLessons = beltProgress.lessons.unlocked;

  const locked = lesson.order >= unlockedLessons;

  if (locked) {
    return res.json({
      success: true,
      lesson: { _id: lesson._id, title: lesson.title, locked: true },
    });
  }

  const progress = await LessonProgress.findOne({
    user: userId,
    lesson: lessonId,
  }).lean();

  res.json({
    success: true,
    lesson: { ...lesson, locked: false, progress },
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
  const userId = req.user._id;

  /* =========================
     1️⃣ Player + Belt
  ========================= */
  const player = await Player.findOne({ user: userId }).select("beltLevel");
  if (!player) throw httpError(404, "Player not found");

  /* =========================
     2️⃣ Attendance
  ========================= */
  const attendance = await getAttendanceSummary(player._id);
  const presentSessions = attendance?.present || 0;

  /* =========================
     3️⃣ Belt ranking rules
  ========================= */
  const beltRanking = await BeltRanking.findOne({
    name: player.beltLevel,
  }).lean();

  if (!beltRanking) {
    throw httpError(
      404,
      `Belt ranking not configured for belt: ${player.beltLevel}`
    );
  }

  const totalLessons = beltRanking.lessons?.totalLessons ?? 0;
  const unlockEvery =
    beltRanking.lessons?.unlockEvery && beltRanking.lessons.unlockEvery > 0
      ? beltRanking.lessons.unlockEvery
      : 1;

  /* =========================
     4️⃣ Calculate unlocked lessons
     كل unlockEvery حضور → درس واحد
  ========================= */
  const unlockedLessons = Math.min(
    totalLessons,
    Math.floor(presentSessions / unlockEvery)
  );

  /* =========================
     5️⃣ Fetch ALL lessons
  ========================= */
  const lessons = await Lesson.find({ isActive: true })
    .populate("program", "title level")
    .populate("module", "title")
    .sort({ order: 1 })
    .lean();

  /* =========================
     6️⃣ Progress (belt scoped)
  ========================= */
  const progresses = await LessonProgress.find({
    user: userId,
    beltLevel: player.beltLevel,
  }).lean();

  const progressMap = new Map(progresses.map((p) => [p.lesson.toString(), p]));

  /* =========================
     7️⃣ Format lessons
  ========================= */
  const formattedLessons = lessons.map((lesson, index) => {
    const progress = progressMap.get(lesson._id.toString()) || null;
    const completed = Boolean(progress?.completed);

    const locked = index >= unlockedLessons;

    let lockedReason = null;
    if (locked) {
      const requiredSessions = (index + 1) * unlockEvery;
      const remaining = requiredSessions - presentSessions;

      lockedReason =
        remaining > 0
          ? `Attend ${remaining} more session${
              remaining > 1 ? "s" : ""
            } to unlock this lesson`
          : null;
    }

    return {
      ...lesson,
      progress, // ✅ مهم
      completed,
      locked,
      unlocked: !locked,
      lockedReason,
    };
  });

  res.json({
    success: true,
    data: {
      attendance,
      lessons: formattedLessons,
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
   GET LESSON QUIZ (NO DEADLOCK)
===================================================== */
export const getLessonQuiz = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.lessonId);
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw httpError(404, "Lesson not found");

  const progress = await LessonProgress.findOne({
    user: userId,
    lesson: lessonId,
  }).lean();

  if (!progress) {
    throw httpError(403, "Start lesson first to unlock quiz");
  }

  res.json({
    success: true,
    data: { quiz: lesson.quiz || [], lessonTitle: lesson.title },
  });
});
/* =====================================================
   SUBMIT LESSON QUIZ
===================================================== */
export const submitLessonQuiz = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const lessonId = assertObjectId(req.params.lessonId);
  const { answers = [] } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const player = await Player.findOne({ user: userId }).select("beltLevel");
  if (!player) throw httpError(404, "Player not found");

  const { score, answers: computed } = computeQuizScore(lesson, answers);
  const passed = score >= 60;
  const now = new Date();

  const progress = await LessonProgress.findOneAndUpdate(
    {
      user: userId,
      lesson: lessonId,
      beltLevel: player.beltLevel,
    },
    {
      $set: {
        quizAnswers: computed,
        quizScore: score,
        completed: passed,
        lastVisitedAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        beltLevel: player.beltLevel,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  res.json({
    success: true,
    data: {
      score,
      passed,
      progress,
      message: passed
        ? "Quiz passed successfully"
        : "Quiz submitted but not passed",
    },
  });
});

/* =====================================================
   COMPLETE LESSON
===================================================== */
export const completeStudentLesson = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw httpError(401, "Unauthorized");

  const lessonId = assertObjectId(req.params.lessonId);

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw httpError(404, "Lesson not found");

  const player = await Player.findOne({ user: userId }).select("beltLevel");
  if (!player) throw httpError(404, "Player not found");

  const now = new Date();

  const progress = await LessonProgress.findOneAndUpdate(
    {
      user: userId,
      lesson: lessonId,
      beltLevel: player.beltLevel,
    },
    {
      $set: {
        completed: true,
        lastVisitedAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        beltLevel: player.beltLevel,
      },
    },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    data: { progress },
  });
});
