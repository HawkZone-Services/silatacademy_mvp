import mongoose from "mongoose";

const AttemptAnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedIndex: Number,
  booleanAnswer: Boolean,
  essayText: String,
  score: Number,
});

const ExamAttemptSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  startedAt: Date,
  submittedAt: Date,

  answers: [AttemptAnswerSchema],

  autoScore: { type: Number, default: 0 },
  manualScore: { type: Number, default: 0 },
  theoryScore: { type: Number, default: 0 },

  pass: { type: Boolean, default: false },

  antiCheat: {
    focusLosses: Number,
    forcedSubmitReason: String,
  },
});

export default mongoose.model("ExamAttempt", ExamAttemptSchema);
