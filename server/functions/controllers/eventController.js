import asyncHandler from "express-async-handler";
import Event from "../models/Event.js";

export const listEvents = asyncHandler(async (req, res) => {
  res.json(await Event.find().sort({ startAt: 1 }));
});

export const getEvent = asyncHandler(async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json(ev);
});

export const createEvent = asyncHandler(async (req, res) => {
  const ev = await Event.create(req.body);
  res.status(201).json(ev);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const ev = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json(ev);
});

export const registerToEvent = asyncHandler(async (req, res) => {
  const { eventId, userId } = req.body;
  const ev = await Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { registeredPlayers: userId } },
    { new: true }
  );
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json({ success: true, event: ev });
});
