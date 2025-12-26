import express from "express";
import {
  myNotifications,
  sendNotification,
  markRead,
} from "../controllers/notificationController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, myNotifications);
router.post("/", protect, checkRole("admin", "instructor"), sendNotification);
router.post("/:id/read", protect, markRead);

export default router;
