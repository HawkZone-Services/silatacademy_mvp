import express from "express";
import rateLimit from "express-rate-limit";
import { check } from "express-validator";
import { login, regUser } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
});

router.post(
  "/register",
  authLimiter,
  validate([
    check("name").notEmpty().withMessage("name is required"),
    check("email").isEmail().withMessage("valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 chars"),
    check("role")
      .isIn(["admin", "instructor", "student"])
      .withMessage("role is required"),
  ]),
  regUser
);
router.post(
  "/login",
  authLimiter,
  validate([
    check("username").notEmpty().withMessage("username is required"),
    check("password").notEmpty().withMessage("password is required"),
  ]),
  login
);

//router.get("/me", protect, me);

export default router;
