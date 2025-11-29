import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },

    // Lesson content
    title: { type: String, required: true, trim: true },
    summary: { type: String },
    videoUrl: { type: String },
    content: { type: String },
    durationMinutes: { type: Number },
    resources: [{ type: String }],

    quiz: { type: Array, default: [] },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LessonSchema.index({ module: 1, title: 1 }, { unique: true });

export default mongoose.model("Lesson", LessonSchema);
