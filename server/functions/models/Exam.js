import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ["mcq", "essay", "truefalse"], default: "mcq" },
  choices: [String],
  correctIndex: Number,
  correctBoolean: Boolean,
  maxScore: { type: Number, default: 1 },
});

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },

  beltLevel: {
    type: String,
    enum: ["white", "yellow", "blue", "brown", "red", "black"],
    required: true,
  },

  type: { type: String, enum: ["theory"], default: "theory" },

  schedule: { startsAt: Date, endsAt: Date },

  timeLimit: { type: Number, default: 20 }, // ⏱️ minutes
  maxTheoryScore: { type: Number, default: 40 },
  passMark: { type: Number, default: 24 }, // 60% of 40

  questions: [QuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: {
    type: String,
    enum: ["draft", "published", "closed"],
    default: "draft",
  },
});

export default mongoose.model("Exam", ExamSchema);
