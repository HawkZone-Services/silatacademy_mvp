import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "essay", "truefalse"],
    default: "mcq",
  },
  choices: [String], // for MCQ
  correctIndex: Number, // for MCQ
  correctBoolean: Boolean, // for True/False
  maxScore: { type: Number, default: 1 }, // MCQ or T/F auto score / essay manual score
});

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },

  beltLevel: {
    type: String,
    enum: ["white", "yellow", "blue", "brown", "red", "black"],
    required: true,
  },

  type: {
    type: String,
    enum: ["theory"],
    default: "theory",
  },

  schedule: {
    startsAt: Date,
    endsAt: Date,
  },

  maxTheoryScore: { type: Number, default: 40 },

  questions: [QuestionSchema],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: {
    type: String,
    enum: ["draft", "published", "closed"],
    default: "draft",
  },
});

const Exam = mongoose.model("Exam", ExamSchema);
export default Exam;
