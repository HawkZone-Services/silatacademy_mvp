import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },

    // ✅ NEW – Academic Meaning
    moduleType: {
      type: String,
      enum: ["A", "B", "P", "E"],
      required: true,
      index: true,
    },

    beltLevel: {
      type: String,
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    objectives: [String],
    anatomyFocus: [String],
    repetitionGoal: String,
    commonMistakes: [String],

    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    // 🆕 LIFECYCLE
    status: {
      type: String,
      enum: ["draft", "ready", "active", "archived"],
      default: "draft",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    activatedAt: Date,
    archivedAt: Date,
  },

  { timestamps: true }
);

export default mongoose.model("Module", ModuleSchema);
