import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    type: {
      type: String,
      enum: ["tournament", "grading", "workshop"],
      required: true,
    },

    description: String,
    location: String,
    startAt: Date,
    endAt: Date,
    coverUrl: String,

    isRegistrationOpen: { type: Boolean, default: true },
    registeredPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // إضافة عشان الـ UI (Events.tsx)
    beltLevel: String, // e.g. "White+"
    capacity: Number,
    instructor: String, // display only (لو عايز تربط بـ Coach ممكن تضيف ref كمان)
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "finished"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;
