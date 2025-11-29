import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    title: { type: String, required: true, trim: true }, // Example: "Month 1-2: Foundations"
    topics: [{ type: String }], // Example: ["Basic stances", “Footwork…”]

    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent duplicate modules inside same program by name
ModuleSchema.index({ program: 1, title: 1 }, { unique: true });

export default mongoose.model("Module", ModuleSchema);
