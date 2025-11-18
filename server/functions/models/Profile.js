import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  title: String,
  date: String,
  description: String,
  type: {
    type: String,
    enum: ["competition", "belt", "workshop", "certificate"],
  },
});

const HealthSchema = new mongoose.Schema({
  status: String,
  lastCheckup: String,
  injuries: [
    {
      type: String,
    },
  ],
  nutritionPlan: String,
  restSchedule: String,
  medicalNotes: String,
});

const TrainingLogSchema = new mongoose.Schema({
  date: String,
  focus: String,
  attendance: Boolean,
  performanceNotes: String,
  coachRemarks: String,
});

const StatsSchema = new mongoose.Schema({
  power: Number,
  flexibility: Number,
  endurance: Number,
  speed: Number,
});

const PlayerProfileSchema = new mongoose.Schema(
  {
    // رابط المستخدم الأساسي
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // بيانات عامة
    name: { type: String, required: true },
    belt: { type: String, required: true },
    beltColor: { type: String },
    age: Number,
    height: String,
    weight: String,
    coach: String,

    trainingStartDate: String,
    trainingYears: Number,

    stats: StatsSchema,

    currentFocus: String,

    achievements: [AchievementSchema],

    health: HealthSchema,

    trainingLogs: [TrainingLogSchema],
  },
  { timestamps: true }
);

const PlayerProfile = mongoose.model("PlayerProfile", PlayerProfileSchema);

export default PlayerProfile;
