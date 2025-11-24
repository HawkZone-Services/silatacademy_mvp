import mongoose from "mongoose";

const LessonProgressSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    completed: { type: Boolean, default: false },
    positionSeconds: { type: Number, default: 0 },
    quizScore: { type: Number, default: 0 },
    quizAnswers: [
      {
        questionIndex: Number,
        selectedIndex: Number,
        correct: Boolean,
      },
    ],
    lastVisitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ lesson: 1, user: 1 }, { unique: true });

const LessonProgress = mongoose.model("LessonProgress", LessonProgressSchema);

export default LessonProgress;
