import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Player from "../models/Player.js";
import { generateToken } from "../utils/generateToken.js";

/* =====================================================
   REGISTER USER (admin / instructor / student)
====================================================== */
export const regUser = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      nationalId,
      phone,
      gender,
      dob,
      profile, // بيانات البروفايل العامة
      player, // بيانات اللاعب لو role = student
    } = req.body;

    // basic validation متوافقة مع User schema
    if (!name || !password || !role || !nationalId || !gender) {
      return res.status(400).json({
        success: false,
        message:
          "name, password, role, nationalId and gender are required fields.",
      });
    }

    const allowedRoles = ["admin", "instructor", "student"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${allowedRoles.join(", ")}`,
      });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    // ===== Check email uniqueness (لو موجود)
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // ===== Check nationalId uniqueness
    const existingNational = await User.findOne({ nationalId });
    if (existingNational) {
      return res.status(400).json({
        success: false,
        message: "National ID already exists",
      });
    }

    // ===== Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ===== Create User
    const user = await User.create({
      name,
      email: normalizedEmail,
      nationalId,
      passwordHash,
      gender,
      dob: dob ? new Date(dob) : undefined,
      phone: phone || undefined,
      role,
      avatarUrl: profile?.avatar || "",
      createdBy: req.user?._id || null,
    });

    // ===== Create Profile (لكل المستخدمين)
    const userProfile = await Profile.create({
      user: user._id,
      firstName: profile?.firstName || name,
      lastName: profile?.lastName || "",
      avatar: profile?.avatar || "",
      address: profile?.address || {},
      bio: profile?.bio || "",
      social: profile?.social || {},
    });

    // ===== Create Player فقط لو role = student
    let playerDoc = null;

    if (role === "student") {
      playerDoc = await Player.create({
        user: user._id,

        beltLevel: player?.beltLevel || "white", // Player schema هيظبط beltColor و beltLabel

        age: player?.age ?? null,
        height: player?.height || "",
        weight: player?.weight || "",
        coach: player?.coach || "",

        trainingStartDate: player?.trainingStartDate || "",
        trainingYears: player?.trainingYears || 0,

        stats: player?.stats || undefined,
        currentFocus: player?.currentFocus || "",
        achievements: player?.achievements || [],
        health: player?.health || {},
        trainingLogs: player?.trainingLogs || [],
      });
    }

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      data: {
        userId: user._id,
        profileId: userProfile._id,
        playerId: playerDoc?._id || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});
export const login = asyncHandler(async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  const input = username.trim().toLowerCase();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isNationalId = /^[0-9]{10,20}$/.test(input);
  const isPhone = /^[0-9]{8,15}$/.test(input);

  const query = {};
  if (isEmail) query.email = input;
  else if (isNationalId) query.nationalId = input;
  else if (isPhone) query.phone = input;
  else {
    return res.status(400).json({
      success: false,
      message: "Invalid username format",
    });
  }

  // Find user
  const user = await User.findOne(query);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  // Validate password
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  // Load profile (optional)
  const profile = await Profile.findOne({ user: user._id }).lean();

  // Load player (only for students)
  const player =
    user.role === "student"
      ? await Player.findOne({ user: user._id }).lean()
      : null;

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user,
      profile: profile || null,
      player: player || null,
      token,
    },
  });
});
