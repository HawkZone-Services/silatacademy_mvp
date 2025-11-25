import asyncHandler from "express-async-handler";
import Event from "../models/Event.js";
import { assertObjectId, httpError } from "../utils/validation.js";

const validateEventPayload = (body) => {
  const { title, type, startAt, endAt } = body;
  const allowedTypes = ["tournament", "grading", "workshop"];
  if (!title) throw httpError(400, "title is required");
  if (type && !allowedTypes.includes(type)) throw httpError(400, "invalid type");
  if (startAt && isNaN(Date.parse(startAt))) throw httpError(400, "invalid startAt");
  if (endAt && isNaN(Date.parse(endAt))) throw httpError(400, "invalid endAt");
};

export const listEvents = asyncHandler(async (req, res) => {
  res.json(await Event.find().sort({ startAt: 1 }));
});

export const getEvent = asyncHandler(async (req, res) => {
  const ev = await Event.findById(assertObjectId(req.params.id, "id"));
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json(ev);
});

export const createEvent = asyncHandler(async (req, res) => {
  validateEventPayload(req.body);
  const ev = await Event.create(req.body);
  res.status(201).json(ev);
});

export const updateEvent = asyncHandler(async (req, res) => {
  validateEventPayload(req.body);
  const ev = await Event.findByIdAndUpdate(
    assertObjectId(req.params.id, "id"),
    req.body,
    { new: true }
  );
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json(ev);
});

export const registerToEvent = asyncHandler(async (req, res) => {
  const { eventId, userId } = req.body;
  const eventObjId = assertObjectId(eventId, "eventId");
  const userObjId = assertObjectId(userId, "userId");
  const ev = await Event.findByIdAndUpdate(
    eventObjId,
    { $addToSet: { registeredPlayers: userObjId } },
    { new: true }
  );
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json({ success: true, event: ev });
});
