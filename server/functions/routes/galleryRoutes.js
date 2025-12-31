import express from "express";
import {
  uploadGallery,
  listGallery,
  deleteGalleryItem,
} from "../controllers/galleryController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { avatarUploadBusboy } from "../middlewares/avatarUploadBusboy.js";

const router = express.Router();

// Upload image (owner)
router.post("/me/gallery", protect, avatarUploadBusboy, uploadGallery);

// List gallery (public / private)
router.get(
  "/players/:userId/gallery",

  listGallery
);

// Delete image
router.delete("/gallery/:mediaId", protect, deleteGalleryItem);

export default router;
