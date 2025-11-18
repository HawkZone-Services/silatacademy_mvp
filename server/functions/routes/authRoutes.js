import express from "express";
import { login, regUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", regUser);
router.post("/login", login);

//router.get("/me", protect, me);

export default router;
