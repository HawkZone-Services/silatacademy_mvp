import asyncHandler from "express-async-handler";
import Ranking from "../models/Ranking.js";
import Player from "../models/Player.js";

export const listRanks = asyncHandler(async (req, res) => {
  const ranks = await Ranking.find().sort({ order: 1 });
  res.json(ranks);
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
