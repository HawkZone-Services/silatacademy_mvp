import express from "express";
import playerRoutes from "../playerRoutes.js";
import examPlayerRoutes from "./examPlayerRoutes.js";
import eventRoutes from "../eventRoutes.js";
import libraryRoutes from "../libraryRoutes.js";
import programRoutes from "../programRoutes.js";
import rankingRoutes from "../rankingRoutes.js";
import certificateRoutes from "../certificateRoutes.js";
import lessonRoutes from "../lessonRoutes.js";
import curriculumRoutes from "../curriculumRoutes.js";
import notificationRoutes from "../notificationRoutes.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use("/exams", examPlayerRoutes);
router.use("/events", eventRoutes);
router.use("/library", libraryRoutes);
router.use("/programs", programRoutes);
router.use("/ranking", rankingRoutes);
router.use("/certificates", certificateRoutes);
router.use("/lessons", lessonRoutes);
router.use("/curriculum", curriculumRoutes);
router.use("/notifications", protect, notificationRoutes);
router.use("/", playerRoutes);

export default router;
