import mongoose from "mongoose";
const EventSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ["tournament", "grading", "workshop"] },
  description: String,
  location: String,
  startAt: Date,
  endAt: Date,
  coverUrl: String,
  isRegistrationOpen: { type: Boolean, default: true },
  registeredPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
