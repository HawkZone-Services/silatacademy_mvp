import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const n = await Notification.create({ ...req.body, user: req.body.user });
  res.status(201).json(n);
});

export const myNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(items);
});
