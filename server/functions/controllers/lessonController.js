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
import Module from "../models/Module.js";

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
  const module = await Module.findById(moduleId);
  if (!module) throw httpError(404, "Module not found");

  if (module.status === "archived") {
    throw httpError(403, "MODULE_ARCHIVED");
  }

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

  // 1️⃣ جلب الدروس
  let lessons = await Lesson.find({})
    .populate({
      path: "module",
      select: "title moduleType beltLevel isActive",
      match: { isActive: true },
    })
    .populate("program", "title level")
    .sort({ order: 1 })
    .lean();

  // 🔥 فلترة الموديول null (بعد الـ populate)
  lessons = lessons.filter((l) => l.module !== null);

  // 2️⃣ لو مفيش مستخدم
  if (!userId) {
    return res.json({ success: true, lessons });
  }

  // 3️⃣ جلب التقدم
  const progresses = await LessonProgress.find({ user: userId }).lean();
  const progressMap = new Map(progresses.map((p) => [p.lesson.toString(), p]));

  // 4️⃣ تخصيب الدروس
  const enrichedLessons = [];

  for (const lesson of lessons) {
    const progress = progressMap.get(lesson._id.toString()) || null;

    let locked = false;
    let lockReason = null;

    // 🔒 منطق P Module
    if (lesson.module?.moduleType === "P") {
      const completion = await getBeltModuleCompletion({
        userId,
        beltLevel: lesson.module.beltLevel,
      });

      if (!completion.A || !completion.B) {
        locked = true;
        lockReason = "COMPLETE_A_AND_B_FIRST";
      }
    }

    enrichedLessons.push({
      ...lesson,
      progress,
      locked,
      lockReason,
    });
  }

  res.json({ success: true, lessons: enrichedLessons });
});

/* =====================================================
   GET SINGLE LESSON (ATTENDANCE-AWARE — NOT ORDER-BASED)
===================================================== */
export const getLesson = asyncHandler(async (req, res) => {
  const lessonId = assertObjectId(req.params.lessonId || req.params.id);
  const userId = req.user?._id;

  const lesson = await Lesson.findById(lessonId)
    .populate("module", "title")
    .populate("program", "title level")
    .lean();

  if (!lesson) throw httpError(404, "Lesson not found");

  // لو مش طالب
  if (!userId) {
    return res.json({
      success: true,
      lesson: { _id: lesson._id, title: lesson.title, locked: true },
    });
  }

  /* =========================
     1️⃣ Player + belt
  ========================= */
  const player = await Player.findOne({ user: userId }).select("beltLevel");
  if (!player) throw httpError(404, "Player not found");

  const beltLevel = normalizeBeltName(player.beltLevel || "white");

  /* =========================
     2️⃣ Attendance
  ========================= */
  const beltProgress = await getMyBeltProgress(userId);
  const attendance = beltProgress?.attendance || {};
  const attendedSessions = attendance.attendedSessions || 0;

  /* =========================
     3️⃣ Belt ranking
  ========================= */
  const beltRanking = await BeltRanking.findOne({
    name: new RegExp(`^${beltLevel}\\s*(belt)?$`, "i"),
  }).lean();

  if (!beltRanking) {
    throw httpError(404, `Belt ranking not configured for belt: ${beltLevel}`);
  }

  const unlockEvery =
    beltRanking.lessons?.unlockEvery && beltRanking.lessons.unlockEvery > 0
      ? beltRanking.lessons.unlockEvery
      : 1;

  /* =========================
     4️⃣ Progress
  ========================= */
  const progress = await LessonProgress.findOne({
    user: userId,
    lesson: lessonId,
    beltLevel,
  }).lean();

  const completed = Boolean(progress?.completed);

  /* =========================
     5️⃣ Determine if lesson is unlocked
     ❗ NOT order-based
  ========================= */
  let locked = true;

  if (completed) {
    locked = false;
  } else {
    // عدد الدروس اللي الطالب يقدر يفتحها
    const allowedUnlocked = Math.floor(attendedSessions / unlockEvery) || 0;

    // ترتيب الدرس وسط كل الدروس
    const lessons = await Lesson.find({ isActive: true })
      .sort({ order: 1 })
      .select("_id")
      .lean();

    const index = lessons.findIndex(
      (l) => String(l._id) === String(lesson._id)
    );

    locked = index >= allowedUnlocked;
  }

  /* =========================
     6️⃣ Response
  ========================= */
  if (locked) {
    return res.json({
      success: true,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        locked: true,
      },
    });
  }

  res.json({
    success: true,
    lesson: {
      ...lesson,
      locked: false,
      progress,
    },
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
   STUDENT AVAILABLE LESSONS — FINAL (NOT INDEX-BASED)
===================================================== */
export const getStudentAvailableLessons = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  /* =========================
     1️⃣ Player + belt
  ========================= */
  const player = await Player.findOne({ user: userId }).select("beltLevel");
  if (!player) throw httpError(404, "Player not found");

  /* =========================
     2️⃣ Attendance summary
  ========================= */
  const beltProgress = await getMyBeltProgress(userId);
  const attendance = beltProgress?.attendance || {};
  const attendedSessions = attendance.attendedSessions || 0;

  /* =========================
     3️⃣ Belt ranking (SOURCE OF TRUTH)
     Handles: white / White / White Belt
  ========================= */
  const beltKey = normalizeBeltName(player.beltLevel);

  const beltRanking = await BeltRanking.findOne({
    name: { $regex: new RegExp(`^${beltKey}`, "i") },
  }).lean();

  if (!beltRanking) {
    throw httpError(
      404,
      `Belt ranking not configured for belt: ${player.beltLevel}`
    );
  }

  const lessonsConfig = beltRanking.lessons || {};

  const totalLessons =
    typeof lessonsConfig.totalLessons === "number"
      ? lessonsConfig.totalLessons
      : 0;

  const unlockEvery =
    typeof lessonsConfig.unlockEvery === "number" &&
    lessonsConfig.unlockEvery > 0
      ? lessonsConfig.unlockEvery
      : 1; // 🔒 safe fallback

  /* =========================
     4️⃣ Calculate unlocked lessons
     every unlockEvery attendance → 1 lesson
  ========================= */
  const unlockedLessons = Math.min(
    totalLessons,
    Math.floor(attendedSessions / unlockEvery)
  );

  /* =========================
     5️⃣ Fetch ALL lessons
     (shown but locked/unlocked)
  ========================= */
  const lessons = await Lesson.find({ isActive: true })
    .populate("program", "title level")
    .populate("module", "title")
    .sort({ order: 1 })
    .lean();

  /* =========================
     6️⃣ Lesson progress (belt-scoped)
  ========================= */
  const progresses = await LessonProgress.find({
    user: userId,
    beltLevel: player.beltLevel,
  }).lean();

  const progressMap = new Map(progresses.map((p) => [p.lesson.toString(), p]));

  /* =========================
     7️⃣ Lock / Unlock logic
  ========================= */
  const formattedLessons = lessons.map((lesson, index) => {
    const progress = progressMap.get(lesson._id.toString());
    const completed = Boolean(progress?.completed);

    const locked = index >= unlockedLessons;

    let lockedReason = null;

    if (locked) {
      const requiredAttendanceForThisLesson = (index + 1) * unlockEvery;
      const remainingSessions =
        requiredAttendanceForThisLesson - attendedSessions;

      lockedReason =
        remainingSessions > 0
          ? `Attend ${remainingSessions} more session${
              remainingSessions > 1 ? "s" : ""
            } to unlock this lesson`
          : null;
    }

    return {
      ...lesson,
      completed,
      locked,
      unlocked: !locked,
      lockedReason,
    };
  });

  /* =========================
     8️⃣ Response
  ========================= */
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
  const passed = score >= 80;
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
        quickCheckScore: score,
        quickCheckPassed: passed,
        lessonState: passed ? "quiz_passed" : "safety_done",
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

  // 1️⃣ Get progress FIRST
  const progress = await LessonProgress.findOne({
    user: userId,
    lesson: lessonId,
    beltLevel: player.beltLevel,
  });

  if (!progress) {
    throw httpError(404, "Lesson progress not found");
  }
  if (!lesson.hasQuiz) {
    progress.quickCheckPassed = true;
  }

  // 2️⃣ Content steps gate
  if (
    !progress.videoCompleted ||
    !progress.pdfCompleted ||
    !progress.drillCompleted ||
    !progress.safetyCompleted
  ) {
    return res.status(403).json({
      message: "All lesson content steps must be completed first",
    });
  }

  // 3️⃣ Quick Check gate
  if (!progress.quickCheckPassed) {
    return res.status(403).json({
      message: "Quick Check must be passed before completing lesson",
    });
  }

  // 4️⃣ Assignment gate (Patch 3)
  if (progress.assignmentRequired && progress.assignmentStatus !== "approved") {
    return res.status(403).json({
      message: "Assignment must be approved before completing lesson",
    });
  }

  // 5️⃣ Mark lesson completed (ONLY HERE)
  progress.completed = true;
  progress.lessonState = "completed";
  progress.lastVisitedAt = new Date();

  await progress.save();

  res.json({
    success: true,
    data: { progress },
  });
});

/* =====================================================
   TRACK LESSON STEP
===================================================== */
export const trackLessonStep = async (req, res) => {
  const { lessonId } = req.params;
  const { step } = req.body; // video | pdf | drill | safety
  const userId = req.user.id;

  const progress = await LessonProgress.findOne({
    user: userId,
    lesson: lessonId,
  });

  if (!progress) {
    return res.status(404).json({ message: "Lesson progress not found" });
  }

  switch (step) {
    case "video":
      progress.videoCompleted = true;
      progress.lessonState = "video_done";
      break;
    case "pdf":
      progress.pdfCompleted = true;
      progress.lessonState = "pdf_done";
      break;
    case "drill":
      progress.drillCompleted = true;
      progress.lessonState = "drill_done";
      break;
    case "safety":
      progress.safetyCompleted = true;
      progress.lessonState = "safety_done";
      break;

    default:
      return res.status(400).json({ message: "Invalid lesson step" });
  }

  await progress.save();
  res.json(progress);
};
