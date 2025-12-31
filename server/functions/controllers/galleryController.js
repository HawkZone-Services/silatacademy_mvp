import asyncHandler from "express-async-handler";
import Media from "../models/Media.js";
import { uploadGalleryImage, deleteMedia } from "../services/mediaService.js";
import { httpError } from "../utils/validation.js";

/* =====================================================
   UPLOAD GALLERY IMAGE
===================================================== */
export const uploadGallery = asyncHandler(async (req, res) => {
  if (!req.file) throw httpError(400, "Image is required");

  const { visibility = "public" } = req.body;
  const userId = req.user._id;

  const media = await uploadGalleryImage({
    userId,
    buffer: req.file.buffer,
    visibility,
    uploadedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: { media },
  });
});

/* =====================================================
   LIST GALLERY (PUBLIC / PRIVATE)
===================================================== */
export const listGallery = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isOwner = req.user && String(req.user._id) === userId;

  const query = {
    user: userId,
    category: "gallery",
    ...(isOwner ? {} : { visibility: "public" }),
  };

  const items = await Media.find(query)
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: { items },
  });
});

/* =====================================================
   DELETE GALLERY IMAGE
===================================================== */
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { mediaId } = req.params;

  const media = await Media.findById(mediaId);
  if (!media) throw httpError(404, "Media not found");

  // Only owner or admin
  if (
    String(media.user) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    throw httpError(403, "Not authorized");
  }

  await deleteMedia(media);

  res.json({
    success: true,
    data: { message: "Gallery image deleted" },
  });
});
