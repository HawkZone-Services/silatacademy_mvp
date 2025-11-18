import express from "express";
import {
  myNotifications,
  sendNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";
const router = express.Router();

router.get("/", protect, myNotifications);
router.post("/", protect, checkRole("admin", "instructor"), sendNotification);

export default router;
