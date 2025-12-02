import express from "express";
import { check } from "express-validator";
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";
import { protect, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

/* ===========================
        MODULE ROUTES
   =========================== */

// GET all modules
router.get("/", listModules);

// GET module by id
router.get("/:id", validate([check("id").isMongoId()]), getModule);

// CREATE module (requires program ID in body)
router.post(
  "/",
  protect,
  checkRole("admin"),
  validate([
    check("title").notEmpty().withMessage("title is required"),
    check("program").optional().isMongoId(),
  ]),
  createModule
);

// UPDATE module
router.patch(
  "/:id",
  protect,
  checkRole("admin"),
  validate([
    check("id").isMongoId(),
    check("title").optional().isString(),
    check("program").optional().isMongoId(),
  ]),
  updateModule
);

// DELETE module
router.delete(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("id").isMongoId()]),
  deleteModule
);

export default router;
