import express from "express";
import { listUsers, updateRole } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  updateAvatar,
} from "../controllers/profileController.js";
import { avatarUploadBusboy } from "../middlewares/avatarUploadBusboy.js";
const router = express.Router();

router.get("/", protect, checkRole("admin"), listUsers);
router.patch("/:id/role", protect, checkRole("admin"), updateRole);
router.patch("/me/avatar", protect, avatarUploadBusboy, updateAvatar);
router.get("/profile/me", protect, getMyProfile);

export default router;
