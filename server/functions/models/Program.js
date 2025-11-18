import mongoose from "mongoose";
const ProgramSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  description: String,
  modules: [
    {
      title: String,
      objectives: [String],
      anatomyFocus: [String],
      repetitionGoal: String,
      commonMistakes: [String],
    },
  ],
  syllabusUrl: String,
});

const Program = mongoose.model("Program", ProgramSchema);

export default Program;
