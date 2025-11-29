import mongoose from "mongoose";

const beltColorMap = {
  white: "#ffffff",
  yellow: "#f5e642",
  blue: "#1e90ff",
  brown: "#8b4513",
  red: "#ff4d4f",
  black: "#000000",
};

const AchievementSchema = new mongoose.Schema(
  {
    title: String,
    date: String,
    description: String,
    type: {
      type: String,
      enum: ["competition", "belt", "workshop", "certificate"],
    },
  },
  { _id: false }
);

const HealthSchema = new mongoose.Schema(
  {
    status: String,
    lastCheckup: String,
    injuries: [String],
    nutritionPlan: String,
    restSchedule: String,
    medicalNotes: String,
  },
  { _id: false }
);

const TrainingLogSchema = new mongoose.Schema(
  {
    date: String,
    focus: String,
    attendance: Boolean,
    performanceNotes: String,
    coachRemarks: String,
  },
  { _id: false }
);

const StatsSchema = new mongoose.Schema(
  {
    power: Number,
    flexibility: Number,
    endurance: Number,
    speed: Number,
  },
  { _id: false }
);

const PlayerExamHistorySchema = new mongoose.Schema(
  {
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
  },
  { _id: false }
);

const PlayerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    beltLevel: {
      type: String,
      enum: ["white", "yellow", "blue", "brown", "red", "black"],
      default: "white",
    },
    beltLabel: { type: String },
    beltColor: {
      type: String,
      default: function () {
        return beltColorMap[this.beltLevel] || beltColorMap.white;
      },
    },

    age: Number,
    height: String,
    weight: String,
    coach: String,

    trainingStartDate: String,
    trainingYears: { type: Number, default: 0 },

    stats: StatsSchema,
    currentFocus: String,
    achievements: [AchievementSchema],
    health: HealthSchema,
    trainingLogs: [TrainingLogSchema],

    exams: [PlayerExamHistorySchema], // belt-specific exam history
  },
  { timestamps: true }
);

PlayerSchema.pre("validate", function (next) {
  const level = (this.beltLevel || "white").toLowerCase();
  this.beltLevel = level;
  if (!this.beltColor) {
    this.beltColor = beltColorMap[level] || beltColorMap.white;
  }
  if (!this.beltLabel && level) {
    const label = `${level.charAt(0).toUpperCase()}${level.slice(1)} Belt`;
    this.beltLabel = label;
  }
  next();
});

const Player = mongoose.model("Player", PlayerSchema);
export default Player;
