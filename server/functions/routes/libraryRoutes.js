import express from "express";
import {
  listLibrary,
  getLibraryItem,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
} from "../controllers/libraryController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", listLibrary);
router.get("/:id", getLibraryItem);
router.post("/", protect, checkRole("admin", "instructor"), createLibraryItem);
router.patch(
  "/:id",
  protect,
  checkRole("admin", "instructor"),
  updateLibraryItem
);
router.delete("/:id", protect, checkRole("admin"), deleteLibraryItem);

export default router;
