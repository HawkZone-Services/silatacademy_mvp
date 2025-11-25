import express from "express";
import adminRoutes from "../adminRoutes.js";
import userRoutes from "../userRoutes.js";
import analyticsRoutes from "../analyticsRoutes.js";
import examAdminRoutes from "./examAdminRoutes.js";
import eventRoutes from "../eventRoutes.js";
import libraryRoutes from "../libraryRoutes.js";
import programRoutes from "../programRoutes.js";
import rankingRoutes from "../rankingRoutes.js";
import certificateRoutes from "../certificateRoutes.js";
import lessonRoutes from "../lessonRoutes.js";
import curriculumRoutes from "../curriculumRoutes.js";
import { protect, checkRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All admin namespace requires auth; most routes further restrict to admin role.
router.use(protect);

// Admin-only resources
router.use("/users", checkRole("admin"), userRoutes);
router.use("/analytics", checkRole("admin"), analyticsRoutes);
router.use("/exams", examAdminRoutes); // contains its own admin/instructor checks
router.use("/events", eventRoutes);
router.use("/library", libraryRoutes);
router.use("/programs", programRoutes);
router.use("/ranking", rankingRoutes);
router.use("/certificates", certificateRoutes);
router.use("/lessons", lessonRoutes);
router.use("/curriculum", curriculumRoutes);
router.use("/", adminRoutes); // admin players CRUD + dashboard/reports

export default router;
