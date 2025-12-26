import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },

  type: {
    type: String,
    enum: [
      "exam",
      "result",
      "system",
      "event",
      "lesson",
      "certificate",
      "belt",
    ],
    required: true,
  },

  link: { type: String },
  meta: { type: Object },

  isRead: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
