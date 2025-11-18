import mongoose from "mongoose";

const PlayerExamHistorySchema = new mongoose.Schema({
  examId: mongoose.Schema.Types.ObjectId,

  date: Date,

  theoryScore: Number,

  practicalScores: {
    morality: Number,
    practicalMethod: Number,
    technique: Number,
    physical: Number,
    mental: Number,
  },

  totalScore: Number,
  passed: Boolean,

  certificateUrl: String,
});

const PlayerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  beltLevel: {
    type: String,
    enum: ["white", "yellow", "blue", "brown", "red", "black"],
    default: "white",
  },

  exams: [PlayerExamHistorySchema], // 🔥 كل 3 شهور إضافة امتحان هنا
});

const Player = mongoose.model("Player", PlayerSchema);
export default Player;
