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

    // NEW FIELDS (requested)
    technicalContent: { type: String },
    medicalContent: { type: String },
    psychologyContent: { type: String },

    // Lesson long content
    content: { type: String },

    durationMinutes: { type: Number },
    resources: [{ type: String }],

    // Lesson order within the program/module
    order: { type: Number, default: 0 },

    quiz: { type: Array, default: [] },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Optional unique index
LessonSchema.index({ module: 1, title: 1 }, { unique: true });

export default mongoose.model("Lesson", LessonSchema);
