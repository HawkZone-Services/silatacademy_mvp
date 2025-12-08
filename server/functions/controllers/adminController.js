import asyncHandler from "express-async-handler";
import { stringify } from "csv-stringify";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Player from "../models/Player.js";
import Attendance from "../models/Attendance.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Profile from "../models/Profile.js";

// =====================================================
// 🟦 DASHBOARD — MONGOOSE VERSION
// =====================================================
export const dashboard = asyncHandler(async (req, res) => {
  const [players, attempts, avgScore, attendanceRate, usersByRole] =
    await Promise.all([
      Player.countDocuments(),

      ExamAttempt.countDocuments(),

      ExamAttempt.aggregate([
        { $group: { _id: null, avg: { $avg: "$autoScore" } } },
      ]),

      Attendance.aggregate([
        {
          $group: {
            _id: null,
            rate: {
              $avg: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
            },
          },
        },
      ]),

      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ]);

  res.json({
    totalPlayers: players,
    totalAttempts: attempts,
    avgScore: avgScore[0]?.avg || 0,
    attendanceRate: attendanceRate[0]?.rate || 0,
    usersByRole,
  });
});

// =====================================================
// 🟧 EXPORT RESULTS CSV
// =====================================================
export const exportResultsCsv = asyncHandler(async (req, res) => {
  const attempts = await ExamAttempt.find({})
    .populate("student", "name email")
    .lean();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=results.csv");

  const stringifier = stringify({
    header: true,
    columns: ["Student", "Email", "Total Score", "Pass"],
  });

  attempts.forEach((a) =>
    stringifier.write([
      a.student?.name || "",
      a.student?.email || "",
      a.autoScore + a.manualScore,
      a.pass,
    ])
  );

  stringifier.pipe(res);
  stringifier.end();
});

// =====================================================
// 🟩 CREATE PLAYER (ADMIN)
// =====================================================
export const adminCreatePlayerProfile = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    nationalId,
    role = "student",
    phone,
    avatar,
    playerData = {},
    gender,
    dob,
    profile = {},
  } = req.body;

  if (!name || !nationalId || !password || !gender) {
    return res.status(400).json({
      message: "name, gender, nationalId, and password are required",
    });
  }

  // Student only
  if (role !== "student") {
    return res.status(400).json({
      message: "adminCreatePlayerProfile is only for creating students",
    });
  }

  // Check existing user
  const existingUser = await User.findOne({ nationalId });
  if (existingUser) {
    return res.status(400).json({ message: "National ID already exists" });
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // ===== CREATE USER =====
  const user = await User.create({
    name,
    email,
    nationalId,
    passwordHash: hashPassword,
    role: "student",
    gender,
    dob,
    phone,
    avatarUrl: avatar || "",
    createdBy: req.user?._id || null,
  });

  // ===== CREATE PROFILE =====
  const userProfile = await Profile.create({
    user: user._id,
    firstName: profile?.firstName || name,
    lastName: profile?.lastName || "",
    avatar: profile?.avatar || "",
    address: profile?.address || {},
    bio: profile?.bio || "",
    social: profile?.social || {},
  });

  // ===== CREATE PLAYER =====
  const player = await Player.create({
    user: user._id,
    beltLevel: playerData?.beltLevel || "white",
    beltColor: playerData?.beltColor,
    age: playerData?.age,
    height: playerData?.height,
    weight: playerData?.weight,
    coach: playerData?.coach,
    trainingStartDate: playerData?.trainingStartDate,
    trainingYears: playerData?.trainingYears || 0,
    stats: playerData.stats || {
      power: 0,
      flexibility: 0,
      endurance: 0,
      speed: 0,
    },
    currentFocus: playerData?.currentFocus,
    achievements: playerData.achievements || [],
    health: playerData.health || {},
    trainingLogs: playerData.trainingLogs || [],
  });

  res.status(201).json({
    message: "Student created successfully",
    userId: user._id,
    profileId: userProfile._id,
    playerId: player._id,
  });
});

// =====================================================
// 🟨 GET ALL PLAYERS
// =====================================================
export const adminGetAllPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({})
    .populate("user", "-passwordHash")
    .lean();

  res.status(200).json(players);
});

// =====================================================
// 🟪 GET PLAYER BY ID
// =====================================================
export const adminGetPlayerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const player = await Player.findById(id)
    .populate("user", "-passwordHash")
    .lean();

  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  res.status(200).json(player);
});

// =====================================================
// 🔵 UPDATE PLAYER
// =====================================================
export const adminUpdatePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    // USER
    name,
    email,
    nationalId,
    gender,
    phone,
    isActive,
    dob,

    // PROFILE
    profile,

    // PLAYER
    beltLevel,
    beltColor,
    age,
    height,
    weight,
    coach,
    trainingStartDate,
    trainingYears,
    stats,
    currentFocus,
    achievements,
    trainingLogs,
    health,
  } = req.body;

  // UPDATE USER
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { name, email, nationalId, gender, phone, dob, isActive },
    { new: true }
  ).lean();

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // UPDATE PROFILE
  await Profile.findOneAndUpdate(
    { user: id },
    {
      firstName: profile?.firstName || updatedUser.name,
      lastName: profile?.lastName,
      avatar: profile?.avatar,
      address: profile?.address,
      bio: profile?.bio,
      social: profile?.social,
    }
  );

  // UPDATE PLAYER
  const updatedPlayer = await Player.findOneAndUpdate(
    { user: id },
    {
      beltLevel,
      beltColor,
      age,
      height,
      weight,
      coach,
      trainingStartDate,
      trainingYears,
      stats,
      currentFocus,
      achievements,
      trainingLogs,
      health,
    },
    { new: true }
  ).lean();

  res.json({
    success: true,
    message: "Player updated successfully",
    data: { user: updatedUser, player: updatedPlayer },
  });
});

// =====================================================
// 🔴 DELETE PLAYER + LINKED USER
// =====================================================
export const adminDeletePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Player.user = userId
  const player = await Player.findOne({ user: id });
  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  // Delete Player
  await Player.deleteOne({ user: id });
  console.log("Deleting profile for user:", id);

  const checkProfile = await Profile.findOne({ user: id });
  console.log("FOUND PROFILE:", checkProfile);
  // Delete Profile (THIS must work)
  await Profile.deleteOne({ user: id });

  // Delete User
  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Player, profile, and user deleted successfully",
  });
});
