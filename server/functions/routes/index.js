import express from "express";
import authRoutes from "./authRoutes.js";
import v1Routes from "./v1/index.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/v1", v1Routes);

export default router;
