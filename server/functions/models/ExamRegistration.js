import mongoose from "mongoose";

const ExamRegistrationSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "examRegistrations" }
);

export default mongoose.model("ExamRegistration", ExamRegistrationSchema);
