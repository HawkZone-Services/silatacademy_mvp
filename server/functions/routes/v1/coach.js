import express from "express";
import coachRoutes from "../coachRoutes.js";

const router = express.Router();

router.use("/", coachRoutes);

export default router;
