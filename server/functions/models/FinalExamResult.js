import mongoose from "mongoose";

const FinalExamResultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  theoryScore: Number,

  practicalScores: {
    morality: Number,
    practicalMethod: Number,
    technique: Number,
    physical: Number,
    mental: Number,
  },

  methodTotal: Number, // theory + practicalMethod
  totalScore: Number, // 500 max
  passed: Boolean,

  date: { type: Date, default: Date.now },
});

const FinalExamResult = mongoose.model(
  "FinalExamResult",
  FinalExamResultSchema
);
export default FinalExamResult;
