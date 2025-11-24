import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Player from "../models/Player.js";
import Notification from "../models/Notification.js";
import { assertObjectId, httpError, toObjectId } from "../utils/validation.js";
import { getDb } from "../utils/mongodb.js";

const computeQuizScore = (lesson, answers = []) => {
  if (!lesson?.quiz?.length) return { score: 0, answers: [] };

  const normalized = answers.map((ans, idx) => ({
    questionIndex: typeof ans.questionIndex === "number" ? ans.questionIndex : idx,
    selectedIndex: typeof ans.selectedIndex === "number" ? ans.selectedIndex : null,
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

const beltToProgramLevel = (belt) => {
  if (["white", "yellow"].includes(belt)) return "beginner";
  if (["blue", "brown"].includes(belt)) return "intermediate";
  if (["red", "black"].includes(belt)) return "advanced";
  return null;
};

const lessonCompletionForBelt = async (db, userId, beltLevel) => {
  const level = beltToProgramLevel(beltLevel);
  if (!level) return { total: 0, completed: 0 };

  const [totalLessons] = await db
    .collection("lessons")
    .aggregate([
      {
        $lookup: {
          from: "programs",
          localField: "program",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
      { $match: { "program.level": level } },
      { $count: "count" },
    ])
    .toArray();

  const [completedLessons] = await db
    .collection("lessonprogresses")
    .aggregate([
      { $match: { user: userId, completed: true } },
      {
        $lookup: {
          from: "lessons",
          localField: "lesson",
          foreignField: "_id",
          as: "lesson",
        },
      },
      { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "programs",
          localField: "lesson.program",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
      { $match: { "program.level": level } },
      { $count: "count" },
    ])
    .toArray();

  return {
    total: totalLessons?.count || 0,
    completed: completedLessons?.count || 0,
  };
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

  res.status(201).json({ success: true, lesson: { ...lessonDoc, _id: result.insertedId } });
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
            { $unwind: { path: "$progress", preserveNullAndEmptyArrays: true } },
          ]
        : []),
      { $sort: { order: 1, createdAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, lessons });
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
            { $unwind: { path: "$progress", preserveNullAndEmptyArrays: true } },
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

  const existing = await LessonProgress.findOne({ lesson: lessonId, user: userId });

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
    { $set: update, $setOnInsert: { lesson: lessonId, user: userId, createdAt: new Date() } },
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
      const db = await getDb();
      const status = await lessonCompletionForBelt(db, userId, player.beltLevel);
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
