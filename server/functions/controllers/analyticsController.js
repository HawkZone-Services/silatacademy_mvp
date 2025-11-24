import asyncHandler from "express-async-handler";
import { getDb } from "../utils/mongodb.js";

export const studentReport = asyncHandler(async (req, res) => {
  const db = await getDb();
  const students = await db
    .collection("users")
    .aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "examAttempts",
          localField: "_id",
          foreignField: "student",
          as: "attempts",
        },
      },
      {
        $lookup: {
          from: "certificates",
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
    ])
    .toArray();

  res.json({ success: true, students });
});

export const beltProgression = asyncHandler(async (req, res) => {
  const db = await getDb();
  const belts = ["white", "yellow", "blue", "brown", "red", "black"];

  const players = await db
    .collection("players")
    .aggregate([
      { $match: {} },
      {
        $group: {
          _id: "$beltLevel",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const byBelt = belts.map((belt) => {
    const row = players.find((p) => p._id === belt);
    return { belt, count: row?.count || 0 };
  });

  res.json({ success: true, progression: byBelt });
});

export const examStatistics = asyncHandler(async (req, res) => {
  const db = await getDb();

  const stats = await db
    .collection("examAttempts")
    .aggregate([
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
    ])
    .toArray();

  res.json({ success: true, exams: stats });
});

export const lessonCompletionStats = asyncHandler(async (req, res) => {
  const db = await getDb();

  const completions = await db
    .collection("lessonprogresses")
    .aggregate([
      { $match: { completed: true } },
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
        $group: {
          _id: "$lesson._id",
          title: { $first: "$lesson.title" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])
    .toArray();

  res.json({ success: true, lessons: completions });
});
