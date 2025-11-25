import mongoose from "mongoose";

const PracticalEvaluationSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    morality: { type: Number, default: 0 },
    practicalMethod: { type: Number, default: 0 },
    technique: { type: Number, default: 0 },
    physical: { type: Number, default: 0 },
    mental: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "practicalEvaluations" }
);

export default mongoose.model(
  "PracticalEvaluation",
  PracticalEvaluationSchema
);
