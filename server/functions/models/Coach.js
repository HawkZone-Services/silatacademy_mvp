import mongoose from "mongoose";
const CoachSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bio: String,
  specialties: [String],
  galleryUrls: [String],
  achievements: [String],
  certifications: [String],
});

const Coach = mongoose.model("Coach", CoachSchema);

export default Coach;
