import express from "express";
import coachRoutes from "../coachRoutes.js";
import attendanceRoutes from "../attendanceRoutes.js";

const router = express.Router();

router.use("/attendance", attendanceRoutes);
router.use("/", coachRoutes);

export default router;
