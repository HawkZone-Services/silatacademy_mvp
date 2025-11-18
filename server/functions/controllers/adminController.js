import asyncHandler from "express-async-handler";
import { stringify } from "csv-stringify";

import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

import { getDb } from "../utils/mongodb.js";
import { generateToken } from "../utils/generateToken.js";

// =====================================================
// DASHBOARD (Native MongoDB)
// =====================================================
export const dashboard = asyncHandler(async (req, res) => {
  const db = await getDb();

  const [players, attempts, avgScoreArr, attendanceRateArr, usersByRole] =
    await Promise.all([
      db.collection("playerProfiles").countDocuments(),
      db.collection("examAttempts").countDocuments(),
      db
        .collection("examAttempts")
        .aggregate([{ $group: { _id: null, avg: { $avg: "$totalScore" } } }])
        .toArray(),
      db
        .collection("attendance")
        .aggregate([
          {
            $group: {
              _id: null,
              rate: {
                $avg: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
              },
            },
          },
        ])
        .toArray(),
      db
        .collection("users")
        .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
        .toArray(),
    ]);

  res.json({
    totalPlayers: players,
    totalAttempts: attempts,
    avgScore: avgScoreArr[0]?.avg || 0,
    attendanceRate: attendanceRateArr[0]?.rate || 0,
    usersByRole,
  });
});

// =====================================================
// EXPORT RESULTS CSV
// =====================================================
export const exportResultsCsv = asyncHandler(async (req, res) => {
  const db = await getDb();

  const attempts = await db
    .collection("examAttempts")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
    ])
    .toArray();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=results.csv");

  const stringifier = stringify({
    header: true,
    columns: ["Student", "Email", "Total Score", "Pass"],
  });

  attempts.forEach((a) =>
    stringifier.write([a.student.name, a.student.email, a.totalScore, a.pass])
  );

  stringifier.pipe(res);
  stringifier.end();
});

// =====================================================
// CREATE PLAYER PROFILE (ADMIN)
// =====================================================
export const adminCreatePlayerProfile = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      nationalId,
      role = "student",
      phone,
      avatar,
      playerData,
    } = req.body;

    if (!name || !nationalId || !password) {
      return res.status(400).json({
        message: "name, nationalId, and password are required",
      });
    }

    const db = await getDb();

    // Check existing user
    const existingUser = await db.collection("users").findOne({ nationalId });
    if (existingUser) {
      return res.status(400).json({ message: "National ID already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // CREATE USER
    const newUser = {
      name,
      email: email || null,
      nationalId,
      password: hashPassword,
      role,
      phone,
      avatarUrl: avatar || "",
      createdBy: req.user?._id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userInsert = await db.collection("users").insertOne(newUser);
    const userId = userInsert.insertedId;

    // CREATE PLAYER PROFILE
    const newProfile = {
      user: userId,
      name,
      belt: playerData?.belt || "White Belt",
      beltColor: playerData?.beltColor || "#ffffff",
      age: playerData?.age || null,
      height: playerData?.height || null,
      weight: playerData?.weight || null,
      trainingStartDate: playerData?.trainingStartDate || null,
      trainingYears: playerData?.trainingYears || 0,
      coach: playerData?.coach || null,
      stats: playerData?.stats || {
        power: 0,
        flexibility: 0,
        endurance: 0,
        speed: 0,
      },
      currentFocus: playerData?.currentFocus || "",
      achievements: playerData?.achievements || [],
      health: playerData?.health || {},
      trainingLogs: playerData?.trainingLogs || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const profileInsert = await db
      .collection("playerProfiles")
      .insertOne(newProfile);

    res.status(201).json({
      message: "Player and profile created successfully",
      userId,
      profileId: profileInsert.insertedId,
    });
  } catch (error) {
    console.error("Admin Create Player Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =====================================================
// GET ALL PLAYERS
// =====================================================
export const adminGetAllPlayers = asyncHandler(async (req, res) => {
  const db = await getDb();

  const players = await db
    .collection("playerProfiles")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ])
    .toArray();

  res.status(200).json(players);
});

// =====================================================
// GET PLAYER BY ID
// =====================================================
export const adminGetPlayerById = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  const player = await db
    .collection("playerProfiles")
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ])
    .toArray();

  if (!player.length)
    return res.status(404).json({ message: "Player not found" });

  res.status(200).json(player[0]);
});

// =====================================================
// UPDATE PLAYER
// =====================================================
export const adminUpdatePlayer = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  const result = await db
    .collection("playerProfiles")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );

  if (result.matchedCount === 0)
    return res.status(404).json({ message: "Player not found" });

  res.status(200).json({ message: "Player updated successfully" });
});

// =====================================================
// DELETE PLAYER + LINKED USER
// =====================================================
export const adminDeletePlayer = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  const player = await db
    .collection("playerProfiles")
    .findOne({ _id: new ObjectId(id) });

  if (!player) return res.status(404).json({ message: "Player not found" });

  // Delete player profile
  await db.collection("playerProfiles").deleteOne({
    _id: new ObjectId(id),
  });

  // Delete linked user
  await db.collection("users").deleteOne({ _id: player.user });

  res.status(200).json({
    message: "Player and user deleted successfully",
  });
});
