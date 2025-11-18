import express from "express";
import { listUsers, updateRole } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", protect, checkRole("admin"), listUsers);
router.patch("/:id/role", protect, checkRole("admin"), updateRole);

export default router;
