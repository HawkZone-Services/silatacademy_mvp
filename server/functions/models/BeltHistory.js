import mongoose from "mongoose";

const BeltHistorySchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromBelt: { type: String, required: true },
    toBelt: { type: String, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "ExamAttempt" },
    createdAt: { type: Date, default: Date.now },
    approvedAt: Date,
    note: String,
    override: {
      type: Boolean,
      default: false,
    },
    overrideReason: String,
    overrideBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const BeltHistory = mongoose.model("BeltHistory", BeltHistorySchema);

export default BeltHistory;
