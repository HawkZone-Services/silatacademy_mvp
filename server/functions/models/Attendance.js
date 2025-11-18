import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  sessionDate: { type: Date, default: Date.now },
  sessionId: String,
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["present", "absent", "late"],
    default: "present",
  },
  notes: String,
});
const Attendance = mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
