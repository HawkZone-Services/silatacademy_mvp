import express from "express";
import {
  adminCreatePlayerProfile,
  adminGetAllPlayers,
  adminGetPlayerById,
  adminUpdatePlayer,
  adminDeletePlayer,
} from "../controllers/adminController.js";

import { protect, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// -----------------------------------------------
// PLAYER PROFILE CRUD (ADMIN ONLY)
// -----------------------------------------------

// ➕ Create Player (User + Profile)
router.post("/players", protect, checkRole("admin"), adminCreatePlayerProfile);

// 📄 Get All Players
router.get("/players", protect, checkRole("admin"), adminGetAllPlayers);

// 🔍 Get Single Player
router.get("/players/:id", protect, checkRole("admin"), adminGetPlayerById);

// ✏️ Update Player
router.put("/players/:id", protect, checkRole("admin"), adminUpdatePlayer);

// 🗑 Delete Player (Profile + User)
router.delete("/players/:id", protect, checkRole("admin"), adminDeletePlayer);

// -------------------------------------------------
// EXISTING ROUTES
// -------------------------------------------------
import { dashboard, exportResultsCsv } from "../controllers/adminController.js";

router.get("/dashboard", protect, checkRole("admin"), dashboard);
router.get("/reports/export", protect, checkRole("admin"), exportResultsCsv);

export default router;
