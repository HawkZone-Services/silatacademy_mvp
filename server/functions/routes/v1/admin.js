import express from "express";
import adminRoutes from "../adminRoutes.js";
import userRoutes from "../userRoutes.js";
import analyticsRoutes from "../analyticsRoutes.js";
import { protect, checkRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All admin namespace requires auth; most routes further restrict to admin role.
router.use(protect);

// Admin-only resources
router.use("/users", checkRole("admin"), userRoutes);
router.use("/analytics", checkRole("admin"), analyticsRoutes);
router.use("/", adminRoutes); // admin players CRUD + dashboard/reports

export default router;
