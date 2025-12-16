import express from "express";
import {
  listRanks,
  createRank,
  eligibleByBelt,
  updateRank,
  deleteRank,
} from "../controllers/rankingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", listRanks);
router.post("/", protect, checkRole("admin"), createRank);
router.get(
  "/:belt/eligible",
  protect,
  checkRole("admin", "instructor"),
  eligibleByBelt
);
router.patch("/:id", protect, checkRole("admin"), updateRank);

router.delete("/:id", protect, checkRole("admin"), deleteRank);
export default router;
