import asyncHandler from "express-async-handler";
import LibraryItem from "../models/Library.js";
import { assertObjectId, httpError } from "../utils/validation.js";

const allowedTypes = ["manual", "video", "philosophy", "guideline"];

const validateLibraryPayload = (body) => {
  if (body.type && !allowedTypes.includes(body.type)) {
    throw httpError(400, "Invalid type");
  }
  if (body.isMembersOnly != null && typeof body.isMembersOnly !== "boolean") {
    throw httpError(400, "isMembersOnly must be boolean");
  }
  if (body.lang && !["en", "ar"].includes(body.lang)) {
    throw httpError(400, "Invalid lang");
  }
};

export const listLibrary = asyncHandler(async (req, res) => {
  const { type, q } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (q)
    filter.$or = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
    ];
  res.json(await LibraryItem.find(filter).sort({ createdAt: -1 }));
});

export const getLibraryItem = asyncHandler(async (req, res) => {
  const item = await LibraryItem.findById(assertObjectId(req.params.id, "id"));
  if (!item) return res.status(404).json({ message: "Library item not found" });
  res.json(item);
});

export const createLibraryItem = asyncHandler(async (req, res) => {
  validateLibraryPayload(req.body);
  const item = await LibraryItem.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json(item);
});

export const updateLibraryItem = asyncHandler(async (req, res) => {
  validateLibraryPayload(req.body);
  const item = await LibraryItem.findByIdAndUpdate(
    assertObjectId(req.params.id, "id"),
    req.body,
    {
      new: true,
    }
  );
  if (!item) return res.status(404).json({ message: "Library item not found" });
  res.json(item);
});

export const deleteLibraryItem = asyncHandler(async (req, res) => {
  await LibraryItem.findByIdAndDelete(assertObjectId(req.params.id, "id"));
  res.json({ success: true });
});
