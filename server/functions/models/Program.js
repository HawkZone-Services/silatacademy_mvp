import mongoose from "mongoose";

const ProgramSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    // 🔹 مطابقة للـ Programs.tsx
    title: { type: String, required: true, trim: true },
    description: String,
    duration: String, // "3–6 months"
    targetAudience: String, // "New students..."
    classSchedule: String, // "2x weekly..."
    learningOutcomes: [String], // array of strings

    // 🔹 نحافظ على التركيب القديم برضه
    moduleRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    modules: [
      {
        title: String,
        objectives: [String],
        anatomyFocus: [String],
        repetitionGoal: String,
        commonMistakes: [String],
        // عشان تبقى قريبة من الـ mock Topics
        topics: [String],
      },
    ],

    syllabusUrl: String,
  },
  { timestamps: true }
);

const Program = mongoose.model("Program", ProgramSchema);

export default Program;
