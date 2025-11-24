import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: String,
    videoUrl: String,
    content: String,
    technicalContent: String,
    medicalContent: String,
    psychologyContent: String,
    resources: [String],
    durationMinutes: Number,
    order: Number,

    quiz: [
      {
        prompt: { type: String, required: true },
        options: [{ type: String }],
        correctIndex: { type: Number, default: 0 },
        explanation: String,
      },
    ],

    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", LessonSchema);

export default Lesson;
