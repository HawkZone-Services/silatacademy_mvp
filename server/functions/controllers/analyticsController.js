import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Certificate from "../models/Certificate.js";
import Player from "../models/Player.js";
import LessonProgress from "../models/LessonProgress.js";
import Lesson from "../models/Lesson.js";

export const studentReport = asyncHandler(async (req, res) => {
  const rawLimit = parseInt(req.query.limit, 10);
  const rawPage = parseInt(req.query.page, 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 50;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: { role: "student" } },
    {
      $lookup: {
        from: ExamAttempt.collection.name,
        localField: "_id",
        foreignField: "student",
        as: "attempts",
      },
    },
    {
      $lookup: {
        from: Certificate.collection.name,
        localField: "_id",
        foreignField: "student",
        as: "certificates",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        beltLevel: 1,
        attemptsCount: { $size: "$attempts" },
        certificatesCount: { $size: "$certificates" },
        lastAttemptAt: { $max: "$attempts.submittedAt" },
      },
    },
    { $sort: { beltLevel: 1, name: 1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [students, total] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments({ role: "student" }),
  ]);

  res.json({
    success: true,
    students,
    meta: { page, limit, total },
  });
});

export const beltProgression = asyncHandler(async (req, res) => {
  const belts = ["white", "yellow", "blue", "brown", "red", "black"];

  const players = await Player.aggregate([
    { $match: {} },
    {
      $group: {
        _id: "$beltLevel",
        count: { $sum: 1 },
      },
    },
  ]);

  const byBelt = belts.map((belt) => {
    const row = players.find((p) => p._id === belt);
    return { belt, count: row?.count || 0 };
  });

  res.json({ success: true, progression: byBelt });
});

export const examStatistics = asyncHandler(async (req, res) => {
  const stats = await ExamAttempt.aggregate([
    {
      $lookup: {
        from: "exams",
        localField: "exam",
        foreignField: "_id",
        as: "exam",
      },
    },
    { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$exam._id",
        title: { $first: "$exam.title" },
        beltLevel: { $first: "$exam.beltLevel" },
        attempts: { $sum: 1 },
        avgScore: { $avg: "$theoryScore" },
        passRate: {
          $avg: {
            $cond: [{ $eq: ["$finalPassed", true] }, 1, 0],
          },
        },
      },
    },
    { $sort: { beltLevel: 1, title: 1 } },
  ]);

  res.json({ success: true, exams: stats });
});

export const lessonCompletionStats = asyncHandler(async (req, res) => {
  const completions = await LessonProgress.aggregate([
    { $match: { completed: true } },
    {
      $lookup: {
        from: Lesson.collection.name,
        localField: "lesson",
        foreignField: "_id",
        as: "lesson",
      },
    },
    { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$lesson._id",
        title: { $first: "$lesson.title" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({ success: true, lessons: completions });
});
