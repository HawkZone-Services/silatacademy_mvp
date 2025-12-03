import express from "express";
import { check } from "express-validator";
import {
  approveRegistration,
  rejectRegistration,
  listRegistrations,
  createExam,
  publishExam,
  updateExam,
  listSubmissions,
  gradeManual2,
  combineScores,
  gradeManual,
} from "../../controllers/examController.js";
import { protect, checkRole } from "../../middlewares/authMiddleware.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

router.use(protect, checkRole("admin", "instructor"));

router.patch("/registration/:id/approve", approveRegistration);
router.patch("/registration/:id/reject", rejectRegistration);
router.get("/registrations/:examId", listRegistrations);

router.post(
  "/",
  validate([
    check("title").notEmpty().withMessage("title is required"),
    check("beltLevel")
      .isIn(["white", "yellow", "blue", "brown", "red", "black"])
      .withMessage("beltLevel invalid"),
    check("questions")
      .optional()
      .isArray()
      .withMessage("questions must be array"),
  ]),
  createExam
);
router.patch(
  "/:examId/publish",
  validate([check("examId").notEmpty().withMessage("examId is required")]),
  publishExam
);
router.patch(
  "/:id",
  validate([
    check("id").notEmpty().withMessage("id is required"),
    check("title").optional().isString(),
    check("beltLevel")
      .optional()
      .isIn(["white", "yellow", "blue", "brown", "red", "black"]),
  ]),
  updateExam
);

router.get("/submissions/:examId", listSubmissions);
router.post(
  "/practical/score",
  validate([
    check("examId").notEmpty().withMessage("examId is required"),
    check("studentId").notEmpty().withMessage("studentId is required"),
    check("scores.technique")
      .isNumeric()
      .withMessage("technique score required"),
    check("scores.performance")
      .isNumeric()
      .withMessage("performance score required"),
    check("scores.discipline")
      .isNumeric()
      .withMessage("discipline score required"),
  ]),
  gradeManual2
);
router.post(
  "/finalize",
  validate([
    check("examId").notEmpty().withMessage("examId is required"),
    check("studentId").notEmpty().withMessage("studentId is required"),
  ]),
  combineScores
);
router.post(
  "/:id/grade",
  validate([
    check("id").notEmpty().withMessage("attempt id is required"),
    check("score").optional().isNumeric(),
  ]),
  gradeManual
);

export default router;
