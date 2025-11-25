import express from "express";
import playerRoutes from "../playerRoutes.js";
import notificationRoutes from "../notificationRoutes.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use("/notifications", protect, notificationRoutes);
router.use("/", playerRoutes);

export default router;
