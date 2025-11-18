import asyncHandler from "express-async-handler";
import Program from "../models/Program.js";

export const listPrograms = asyncHandler(async (req, res) => {
  res.json(await Program.find().sort({ level: 1 }));
});
export const getProgram = asyncHandler(async (req, res) => {
  const p = await Program.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Program not found" });
  res.json(p);
});
export const createProgram = asyncHandler(async (req, res) => {
  const p = await Program.create(req.body);
  res.status(201).json(p);
});
export const updateProgram = asyncHandler(async (req, res) => {
  const p = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!p) return res.status(404).json({ message: "Program not found" });
  res.json(p);
});
