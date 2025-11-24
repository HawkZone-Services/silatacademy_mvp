import mongoose from "mongoose";

const TrainingTaskSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ["assigned", "in_progress", "done"],
      default: "assigned",
    },
  },
  { timestamps: true }
);

const TrainingTask = mongoose.model("TrainingTask", TrainingTaskSchema);

export default TrainingTask;
