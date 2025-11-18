import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const q = role ? { role } : {};
  const users = await User.find(q)
    .select("-passwordHash")
    .sort({ createdAt: -1 });
  res.json(users);
});

export const updateRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});
