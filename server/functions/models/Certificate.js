import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },

  scores: {
    morality: Number,
    method: Number,
    technique: Number,
    physical: Number,
    mental: Number,
    total: Number,
  },

  passed: Boolean,
  beltLevel: String, // player's belt AFTER exam
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Certificate = mongoose.model("Certificate", CertificateSchema);

export default Certificate;
