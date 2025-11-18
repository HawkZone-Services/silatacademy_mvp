import mongoose from "mongoose";
const RankingSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Blue Belt"
  color: String,
  order: Number,
  requirements: {
    jurus: [String],
    combat: String,
    flexibility: String,
    minHours: Number,
  },
  references: {
    videos: [String],
    docs: [String],
  },
});

const Ranking = mongoose.model("Ranking", RankingSchema);

export default Ranking;
