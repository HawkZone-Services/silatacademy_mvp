import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { getDb } from "../utils/mongodb.js";
import { generateToken } from "../utils/generateToken.js";

// =======================
// REGISTER USER (admin creates: admin | instructor | student)
// =======================
export const regUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role, nationalId, phone, profile } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, role, and password are required",
      });
    }

    const db = await getDb("silatacademy");
    const normalizedEmail = email.toLowerCase().trim();

    // Check email
    const existingEmail = await db
      .collection("users")
      .findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check national ID
    if (nationalId) {
      const existingNational = await db
        .collection("users")
        .findOne({ nationalId });

      if (existingNational) {
        return res.status(400).json({
          success: false,
          message: "National ID already exists",
        });
      }
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      name,
      email: normalizedEmail,
      passwordHash: hashPassword,
      role,
      nationalId: nationalId || null,
      phone: phone || null,
      avatarUrl: profile?.avatar || "",
      createdBy: req.user?._id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userResult = await db.collection("users").insertOne(newUser);
    const userId = userResult.insertedId;

    // Create profile
    const newProfile = {
      user: userId,
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      avatar: profile?.avatar || "",
      address: profile?.address || {},
      bio: profile?.bio || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const profileResult = await db.collection("profiles").insertOne(newProfile);

    // Link profile
    await db
      .collection("users")
      .updateOne(
        { _id: userId },
        { $set: { profile: profileResult.insertedId } }
      );

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      data: {
        userId,
        profileId: profileResult.insertedId,
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

  const db = await getDb("silatacademy");
  const input = username.trim().toLowerCase();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isNationalId = /^[0-9]{10,20}$/.test(input);
  const isPhone = /^[0-9]{8,15}$/.test(input);

  let query = {};

  if (isEmail) query.email = input;
  else if (isNationalId) query.nationalId = input;
  else if (isPhone) query.phone = input;
  else {
    return res.status(400).json({
      success: false,
      message: "Invalid username format",
    });
  }

  const user = await db.collection("users").findOne(query);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // 🔥 FIX HERE: passwordHash OR old password
  const storedHash = user.passwordHash || user.password;

  if (!storedHash) {
    return res.status(500).json({
      success: false,
      message: "Password is missing for this user.",
    });
  }

  const match = await bcrypt.compare(password, storedHash);

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const token = generateToken(user._id, user.role);

  const profile = await db
    .collection("playerProfiles")
    .findOne({ user: user._id });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        role: user.role,
        profile: profile || null,
      },
      token,
    },
  });
});
