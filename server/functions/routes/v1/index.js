import express from "express";
import adminRoutes from "./admin.js";
import playerRoutes from "./player.js";
import coachRoutes from "./coach.js";
import examRoutes from "./exams.js";
import lessonRoutes from "../lessonRoutes.js";
import certificateRoutes from "../certificateRoutes.js";
import attendanceRoutes from "../attendanceRoutes.js";
import programRoutes from "../programRoutes.js";
import rankingRoutes from "../rankingRoutes.js";
import notificationRoutes from "../notificationRoutes.js";
import eventRoutes from "../eventRoutes.js";
import libraryRoutes from "../libraryRoutes.js";
import curriculumRoutes from "../curriculumRoutes.js";
import moduleRoutes from "../moduleRoutes.js";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/player", playerRoutes);
router.use("/coach", coachRoutes);
router.use("/exams", examRoutes);
router.use("/lessons", lessonRoutes);
router.use("/certificates", certificateRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/programs", programRoutes);
router.use("/modules", moduleRoutes);
router.use("/ranking", rankingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/events", eventRoutes);
router.use("/library", libraryRoutes);
router.use("/curriculum", curriculumRoutes);

export default router;
