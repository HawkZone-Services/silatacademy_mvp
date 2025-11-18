import mongoose from "mongoose";

const AttemptAnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedIndex: Number, // MCQ
  booleanAnswer: Boolean, // True/False
  essayText: String,
  score: Number,
});

const ExamAttemptSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  startedAt: Date,
  submittedAt: Date,

  answers: [AttemptAnswerSchema],

  autoScore: Number, // MCQ/T-F auto
  manualScore: Number, // Essay manually graded
  theoryScore: Number, // auto + manual

  antiCheat: {
    focusLosses: Number,
    forcedSubmitReason: String,
  },
});

const ExamAttempt = mongoose.model("ExamAttempt", ExamAttemptSchema);
export default ExamAttempt;
