import mongoose from "mongoose";

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },

    // Optional: beltLevel snapshot for reporting
    beltLevel: { type: String },

    type: {
      type: String,
      enum: ["video", "reflection"],
      default: "video",
      index: true,
    },

    // Firebase Storage URL
    mediaUrl: { type: String, default: "" },

    // Reflection text if needed
    textContent: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "needs_improvement", "redo"],
      default: "pending",
      index: true,
    },

    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    coachFeedback: { type: String, default: "" },

    // Optional: rubric score if you add points later
    rubricScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate active submissions for same student+lesson (optional but useful)
AssignmentSubmissionSchema.index({ student: 1, lesson: 1, status: 1 });

export default mongoose.model(
  "AssignmentSubmission",
  AssignmentSubmissionSchema
);
