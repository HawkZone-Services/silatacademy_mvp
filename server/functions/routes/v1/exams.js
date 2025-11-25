import express from "express";
import examPlayerRoutes from "./examPlayerRoutes.js";
import examAdminRoutes from "./examAdminRoutes.js";

const router = express.Router();

router.use("/", examPlayerRoutes);
router.use("/admin", examAdminRoutes);

export default router;
