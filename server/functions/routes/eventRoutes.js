import express from "express";
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  registerToEvent,
} from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", listEvents);
router.get("/:id", getEvent);
router.post("/", protect, checkRole("admin"), createEvent);
router.patch("/:id", protect, checkRole("admin"), updateEvent);
router.post("/register", protect, registerToEvent);

export default router;
