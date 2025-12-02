// server/functions/models/Module.js
import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },

    title: { type: String, required: true, trim: true },
    objectives: [String],
    anatomyFocus: [String],
    repetitionGoal: String,
    commonMistakes: [String],

    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", ModuleSchema);

export default Module;
