import mongoose from "mongoose";

const BeltRankingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "White Belt"
    color: { type: String, required: true }, // hex
    level: { type: String, required: true }, // Beginner / Intermediate / ...
    duration: String, // "3–6 months"
    requirements: [String],
    testingCriteria: String,
    order: { type: Number, default: 0 },
  },
  { collection: "beltRankings", timestamps: true }
);

const BeltRanking = mongoose.model("BeltRanking", BeltRankingSchema);

export default BeltRanking;
