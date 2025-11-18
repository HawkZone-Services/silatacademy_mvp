import express from "express";
import { createCertificate } from "../controllers/certificateController.js";

import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, checkRole("admin", "coach"), createCertificate);

export default router;
