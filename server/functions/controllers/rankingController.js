import asyncHandler from "express-async-handler";
import Ranking from "../models/BeltRanking.js";
import Player from "../models/Player.js";

export const listRanks = asyncHandler(async (req, res) => {
  const ranks = await Ranking.find().sort({ order: 1 });
  res.status(200).json(ranks);
});

export const createRank = asyncHandler(async (req, res) => {
  const rank = await Ranking.create(req.body);
  res.status(201).json(rank);
});

export const eligibleByBelt = asyncHandler(async (req, res) => {
  const { belt } = req.params;
  // مثال تبسيطي: players بنفس الحزام الحالي
  const players = await Player.find({ beltLevel: belt }).populate(
    "user",
    "name email"
  );
  res.json(players);
});

export const updateRank = asyncHandler(async (req, res) => {
  const rank = await Ranking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!rank) throw httpError(404, "Rank not found");
  res.json(rank);
});

export const deleteRank = asyncHandler(async (req, res) => {
  const rank = await Ranking.findByIdAndDelete(req.params.id);
  if (!rank) throw httpError(404, "Rank not found");
  res.json(rank);
});
