import express from "express";
import {
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  listModulesByProgram,
} from "../controllers/programController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", listPrograms);
router.get("/:id", getProgram);
router.post("/", protect, checkRole("admin"), createProgram);
router.patch("/:id", protect, checkRole("admin"), updateProgram);
router.delete("/:id", protect, checkRole("admin"), deleteProgram);
/* ===========================
    NESTED MODULE ROUTES
    /api/programs/:programId/modules
   =========================== */

router.get("/:programId/modules", listModulesByProgram);

export default router;
