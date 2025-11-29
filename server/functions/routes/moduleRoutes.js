import express from "express";
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";

const router = express.Router();

/* ===========================
        MODULE ROUTES
   =========================== */

// GET all modules
router.get("/", listModules);

// GET module by id
router.get("/:id", getModule);

// CREATE module (requires program ID in body)
router.post("/", createModule);

// UPDATE module
router.patch("/:id", updateModule);

// DELETE module
router.delete("/:id", deleteModule);

export default router;
