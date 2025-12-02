// models/Certificate.js
import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: [
        "exam",
        "completion",
        "attendance",
        "performance",
        "manual",
        "module",
        "program",
        "practical",
        "theory",
      ],
      required: true,
    },

    title: String,
    description: String,
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },

    meta: Object,

    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", CertificateSchema);
