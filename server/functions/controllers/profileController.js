import asyncHandler from "express-async-handler";
import Profile from "../models/Profile.js";
import { uploadAvatar } from "../services/storageService.js";
import { httpError } from "../utils/validation.js";

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.user) throw httpError(401, "Unauthorized");

  if (!req.file) {
    throw httpError(400, "Avatar image is required");
  }

  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    throw httpError(404, "Profile not found");
  }

  const avatarUrl = await uploadAvatar({
    fileBuffer: req.file.buffer,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    userId: req.user._id.toString(),
    oldAvatarUrl: profile.avatar,
  });

  profile.avatar = avatarUrl;
  await profile.save();

  res.json({
    success: true,
    avatar: avatarUrl,
  });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) throw httpError(404, "Profile not found");
  res.json(profile);
});
