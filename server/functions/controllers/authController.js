import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { getDb } from "../utils/mongodb.js";
import { generateToken } from "../utils/generateToken.js";

// =======================
// REGISTER USER (admin creates: admin | instructor | student)
// =======================
export const regUser = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role, // admin | instructor | student
      nationalId,
      phone,
      profile,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, role, and password are required",
      });
    }

    const db = await getDb("silatacademy");

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check nationalId duplicates (for instructors and students)
    if (nationalId) {
      const existingNational = await db
        .collection("users")
        .findOne({ nationalId });
      if (existingNational) {
        return res.status(400).json({ message: "National ID already exists" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      name,
      email: normalizedEmail,
      password: hashPassword,
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

    // Link profile to user
    await db
      .collection("users")
      .updateOne(
        { _id: userId },
        { $set: { profile: profileResult.insertedId } }
      );

    res.status(201).json({
      message: `${role} registered successfully`,
      userId,
      profileId: profileResult.insertedId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
});
export const login = asyncHandler(async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({
        message: "Username (email or national ID) and password required",
      });
  }

  const db = await getDb("silatacademy");

  // Normalize
  const input = username.trim().toLowerCase();

  // Detect login type
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isNationalId = /^[0-9]{10,20}$/.test(input);
  const isPhone = /^[0-9]{8,15}$/.test(input);

  let query = {};

  if (isEmail) {
    query.email = input;
  } else if (isNationalId) {
    query.nationalId = input;
  } else if (isPhone) {
    query.phone = input;
  } else {
    return res.status(400).json({
      message:
        "Invalid username format. Use email, national ID, or phone number",
    });
  }

  // Find user
  const user = await db.collection("users").findOne(query);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Compare password
  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "Invalid username or password" });

  // Generate token
  const token = generateToken(user._id, user.role);

  // Fetch full profile if available
  let profile = await db
    .collection("playerProfiles")
    .findOne({ user: user._id });

  res.json({
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      nationalId: user.nationalId,
      role: user.role,
      profile,
    },
    token,
  });
});
