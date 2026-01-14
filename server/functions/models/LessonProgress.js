import mongoose from "mongoose";

const LessonProgressSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    beltLevel: { type: String, required: true },
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
    lessonState: {
      type: String,
      enum: [
        "not_started",
        "video_done",
        "pdf_done",
        "drill_done",
        "safety_done",
        "quiz_passed",
        "assignment_pending",
        "assignment_approved",
        "completed",
      ],
      default: "not_started",
      index: true,
    },
    videoCompleted: { type: Boolean, default: false },
    pdfCompleted: { type: Boolean, default: false },
    drillCompleted: { type: Boolean, default: false },
    safetyCompleted: { type: Boolean, default: false },
    quickCheckPassed: { type: Boolean, default: false },
    quickCheckScore: { type: Number, default: 0 },

    assignmentRequired: { type: Boolean, default: false },
    assignmentStatus: {
      type: String,
      enum: ["none", "pending", "approved", "needs_improvement", "redo"],
      default: "none",
      index: true,
    },
    assignmentSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignmentSubmission",
      default: null,
    },
  },

  { timestamps: true }
);

LessonProgressSchema.index(
  { user: 1, lesson: 1, completed: 1, beltLevel: 1 },
  { unique: true }
);
const LessonProgress = mongoose.model("LessonProgress", LessonProgressSchema);

export default LessonProgress;
