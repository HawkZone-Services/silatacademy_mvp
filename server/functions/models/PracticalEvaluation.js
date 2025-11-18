import mongoose from "mongoose";

const PracticalEvaluationSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  morality: { type: Number, default: 0 }, // 0–100
  practicalMethod: { type: Number, default: 0 }, // 0–(100 - theory)
  technique: { type: Number, default: 0 }, // 0–100
  physical: { type: Number, default: 0 }, // 0–100
  mental: { type: Number, default: 0 }, // 0–100

  createdAt: { type: Date, default: Date.now },
});

const PracticalEvaluation = mongoose.model(
  "PracticalEvaluation",
  PracticalEvaluationSchema
);
export default PracticalEvaluation;
