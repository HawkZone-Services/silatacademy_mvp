import express from "express";
import { check } from "express-validator";
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
import { validate } from "../middlewares/validate.js";
const router = express.Router();

router.get("/", listPrograms);
router.get("/:id", validate([check("id").isMongoId()]), getProgram);
router.post(
  "/",
  protect,
  checkRole("admin"),
  validate([check("title").notEmpty(), check("level").optional().isString()]),
  createProgram
);
router.patch(
  "/:id",
  protect,
  checkRole("admin"),
  validate([
    check("id").isMongoId(),
    check("title").optional().isString(),
    check("level").optional().isString(),
  ]),
  updateProgram
);
router.delete(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("id").isMongoId()]),
  deleteProgram
);
/* ===========================
    NESTED MODULE ROUTES
    /api/programs/:programId/modules
   =========================== */

router.get(
  "/:programId/modules",
  validate([check("programId").isMongoId()]),
  listModulesByProgram
);

export default router;
