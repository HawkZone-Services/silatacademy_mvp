import express from "express";
import adminRoutes from "./admin.js";
import playerRoutes from "./player.js";
import coachRoutes from "./coach.js";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/player", playerRoutes);
router.use("/coach", coachRoutes);

export default router;
