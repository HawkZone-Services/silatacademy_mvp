import express from "express";
import { check } from "express-validator";
import {
  listLibrary,
  getLibraryItem,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
} from "../controllers/libraryController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
const router = express.Router();

router.get("/", listLibrary);
router.get("/:id", validate([check("id").isMongoId()]), getLibraryItem);
router.post(
  "/",
  protect,
  checkRole("admin", "instructor"),
  validate([check("title").notEmpty().withMessage("title required")]),
  createLibraryItem
);
router.patch(
  "/:id",
  protect,
  checkRole("admin", "instructor"),
  validate([check("id").isMongoId()]),
  updateLibraryItem
);
router.delete(
  "/:id",
  protect,
  checkRole("admin"),
  validate([check("id").isMongoId()]),
  deleteLibraryItem
);

export default router;
