import express from "express";
import {
  listRanks,
  createRank,
  eligibleByBelt,
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

export default router;
