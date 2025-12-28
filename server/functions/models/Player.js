import mongoose from "mongoose";

const beltColorMap = {
  white: "#ffffff",
  yellow: "#f5e642",
  blue: "#1e90ff",
  brown: "#8b4513",
  red: "#ff4d4f",
  black: "#000000",
};

const beltOrderMap = {
  white: 0,
  yellow: 1,
  blue: 2,
  brown: 3,
  red: 4,
  black: 5,
};

/* =========================
   SUB SCHEMAS
========================= */

const AchievementSchema = new mongoose.Schema(
  {
    title: String,
    date: Date,
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
    lastCheckup: Date,
    injuries: [String],
    nutritionPlan: String,
    restSchedule: String,
    medicalNotes: String,
  },
  { _id: false }
);

const TrainingLogSchema = new mongoose.Schema(
  {
    date: Date,
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

/* =========================
   PLAYER SCHEMA
========================= */

const PlayerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* ---------- BELT ---------- */
    beltLevel: {
      type: String,
      enum: ["white", "yellow", "blue", "brown", "red", "black"],
      default: "white",
    },

    beltOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    beltLabel: String,

    beltColor: {
      type: String,
      default: function () {
        return beltColorMap[this.beltLevel] || beltColorMap.white;
      },
    },

    /* ---------- PROFILE ---------- */
    age: Number,
    height: String,
    weight: String,
    coach: String,

    trainingStartDate: Date,
    trainingYears: { type: Number, default: 0 },

    /* ---------- PERFORMANCE ---------- */
    stats: StatsSchema,
    currentFocus: String,
    achievements: [AchievementSchema],
    health: HealthSchema,
    trainingLogs: [TrainingLogSchema],

    /* ---------- EXAMS ---------- */
    exams: [PlayerExamHistorySchema],

    /* ---------- GAMIFICATION ---------- */
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: Date,

    totalLessonsCompleted: { type: Number, default: 0 },
    totalExamsPassed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* =========================
   PRE-VALIDATE NORMALIZATION
========================= */
PlayerSchema.pre("validate", function (next) {
  const level = (this.beltLevel || "white").toLowerCase();

  this.beltLevel = level;
  this.beltOrder = beltOrderMap[level] ?? 0;
  this.beltColor = beltColorMap[level] || beltColorMap.white;

  if (!this.beltLabel) {
    this.beltLabel = `${level.charAt(0).toUpperCase()}${level.slice(1)} Belt`;
  }

  next();
});

const Player = mongoose.model("Player", PlayerSchema);
export default Player;
