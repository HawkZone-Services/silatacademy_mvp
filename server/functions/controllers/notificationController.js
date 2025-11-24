import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const n = await Notification.create({ ...req.body, user: req.body.user });
  res.status(201).json({ success: true, notification: n });
});

export const myNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id })
    .sort({
      createdAt: -1,
    })
    .lean();
  res.json({ success: true, notifications: items });
});

export const markRead = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await Notification.updateOne(
    { _id: id, user: req.user._id },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});
