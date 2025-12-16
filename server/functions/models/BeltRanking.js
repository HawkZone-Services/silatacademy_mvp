import mongoose from "mongoose";

const BeltRankingSchema = new mongoose.Schema(
  {
    name: String, // White Belt
    level: String, // Beginner
    order: Number,

    attendance: {
      requiredSessions: Number, // مثال: 15 يوم
      requiredHours: Number, // مثال: 30 ساعة
      minRate: Number, // 70%
    },

    lessons: {
      totalLessons: Number, // مثال: 30
      unlockEvery: Number, // كل 5 حضور يفتح 3 دروس
    },

    requirements: [String],
  },
  { collection: "beltRankings", timestamps: true }
);

const BeltRanking = mongoose.model("BeltRanking", BeltRankingSchema);

export default BeltRanking;
