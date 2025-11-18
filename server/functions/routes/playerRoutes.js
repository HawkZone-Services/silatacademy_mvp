import express from "express";
import {
  listPlayers,
  getPlayer,
  // createPlayer,
  updatePlayer,
  deletePlayer,
  addAttendance,
  getAttendance,
  playerReportPdf,
  promotePlayer,
  addExamToPlayer,
} from "../controllers/playerController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listPlayers);
router.get("/:id", getPlayer);
//router.post("/", protect, checkRole("admin", "instructor"), createPlayer);
router.patch("/:id", protect, checkRole("admin", "instructor"), updatePlayer);
router.delete("/:id", protect, checkRole("admin"), deletePlayer);

router.get("/:id/attendance", protect, getAttendance);
router.post(
  "/:id/attendance",
  protect,
  checkRole("admin", "instructor"),
  addAttendance
);

router.get("/:id/report.pdf", protect, playerReportPdf);

router.patch(
  "/:id/promote",
  protect,
  checkRole("admin", "instructor"),
  promotePlayer
);

router.post("/:id/addExam", protect, addExamToPlayer);

export default router;
