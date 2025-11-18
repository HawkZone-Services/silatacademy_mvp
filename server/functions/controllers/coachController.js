import asyncHandler from "express-async-handler";
import Coach from "../models/Coach.js";

export const listCoaches = asyncHandler(async (req, res) => {
  const coaches = await Coach.find().populate("user", "name email avatarUrl");
  res.json(coaches);
});

export const getCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findById(req.params.id).populate(
    "user",
    "name email avatarUrl"
  );
  if (!coach) return res.status(404).json({ message: "Coach not found" });
  res.json(coach);
});

export const createCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.create(req.body);
  res.status(201).json(coach);
});

export const updateCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!coach) return res.status(404).json({ message: "Coach not found" });
  res.json(coach);
});
