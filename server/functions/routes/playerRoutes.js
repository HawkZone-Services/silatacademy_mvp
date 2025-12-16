import express from "express";
import { check } from "express-validator";
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
  getEligibility,
  getMyBeltProgress,
} from "../controllers/playerController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.get("/", listPlayers);
router.get("/eligibility", protect, checkRole("student"), getEligibility);
router.get(
  "/:id",
  protect,
  checkRole("admin", "instructor"),
  validate([check("id").isMongoId().withMessage("invalid player id")]),
  getPlayer
);
//router.post("/", protect, checkRole("admin", "instructor"), createPlayer);
router.patch(
  "/:id",
  protect,
  checkRole("admin", "instructor"),
  validate([
    check("id").isMongoId().withMessage("invalid player id"),
    check("beltLevel").optional().isString(),
    check("name").optional().isString(),
  ]),
  updatePlayer
);
router.delete(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("id").isMongoId().withMessage("invalid player id")]),
  deletePlayer
);

router.get(
  "/:id/attendance",
  protect,
  validate([check("id").isMongoId().withMessage("invalid player id")]),
  getAttendance
);
router.post(
  "/:id/attendance",
  protect,
  checkRole("admin", "instructor"),
  validate([
    check("id").isMongoId().withMessage("invalid player id"),
    check("status").optional().isIn(["present", "absent", "late"]),
    check("date").optional().isISO8601(),
    check("coachId").optional().isMongoId(),
  ]),
  addAttendance
);

router.get("/:id/report.pdf", protect, playerReportPdf);

router.patch(
  "/:id/promote",
  protect,
  checkRole("admin", "instructor"),
  validate([
    check("id").isMongoId().withMessage("invalid player id"),
    check("nextBelt").optional().isString(),
  ]),
  promotePlayer
);

router.post(
  "/:id/addExam",
  protect,
  validate([check("id").isMongoId().withMessage("invalid player id")]),
  addExamToPlayer
);

router.get(
  "/my/belt-progress",
  protect,
  checkRole("student"),
  getMyBeltProgress
);

export default router;
