// models/Certificate.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const CertificateSchema = new Schema(
  {
    // 🔑 Core ownership
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔑 Exam linkage (strong, immutable)
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    finalResult: {
      type: Schema.Types.ObjectId,
      ref: "FinalExamResult",
      required: true,
    },

    // 🔒 Belt snapshot at time of certification
    beltLevel: {
      type: String,
      required: true,
    },

    // 🔢 Optional serial / public ID
    certificateNumber: {
      type: String,
      unique: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    // 🔗 Optional logical link to belt upgrade request
    beltHistory: {
      type: Schema.Types.ObjectId,
      ref: "BeltHistory",
    },

    // 🧩 Backward-compat support (keep existing usage)
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
      default: "exam",
    },

    title: String,
    description: String,
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

/* =====================================================
   INDEXES (CRITICAL)
===================================================== */

// ❌ Prevent duplicate certificate for same exam
CertificateSchema.index({ player: 1, exam: 1 }, { unique: true });

// ❌ Prevent issuing two certificates for same belt
CertificateSchema.index({ player: 1, beltLevel: 1 }, { unique: true });

export default mongoose.model("Certificate", CertificateSchema);
