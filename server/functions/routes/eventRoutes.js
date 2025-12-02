import express from "express";
import { check } from "express-validator";
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  registerToEvent,
} from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
const router = express.Router();

router.get("/", listEvents);
router.get("/:id", validate([check("id").isMongoId()]), getEvent);
router.post(
  "/",
  protect,
  checkRole("admin"),
  validate([
    check("title").notEmpty(),
    check("date").optional().isISO8601(),
    check("location").optional().isString(),
  ]),
  createEvent
);
router.patch(
  "/:id",
  protect,
  checkRole("admin"),
  validate([
    check("id").isMongoId(),
    check("title").optional().isString(),
    check("date").optional().isISO8601(),
    check("location").optional().isString(),
  ]),
  updateEvent
);
router.post(
  "/register",
  protect,
  validate([check("eventId").notEmpty().isMongoId()]),
  registerToEvent
);

export default router;
