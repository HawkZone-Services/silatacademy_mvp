import express from "express";
import {
  listCoaches,
  getCoach,
  createCoach,
  updateCoach,
} from "../controllers/coachController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", listCoaches);
router.get("/:id", getCoach);
router.post("/", protect, checkRole("admin"), createCoach);
router.patch("/:id", protect, checkRole("admin"), updateCoach);

export default router;
