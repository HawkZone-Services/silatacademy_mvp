import mongoose from "mongoose";

const TestRegistrationSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});

const TestRegistration = mongoose.model(
  "TestRegistration",
  TestRegistrationSchema
);

export default TestRegistration;
