import mongoose from "mongoose";

const ProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Beginner, Intermediate, Advanced
    level: { type: String }, // optional label
    duration: { type: String }, // “3–6 months”
    description: { type: String },
    targetAudience: { type: String },
    classSchedule: { type: String },

    // From mock data
    learningOutcomes: [{ type: String }],

    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Program", ProgramSchema);
