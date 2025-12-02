import mongoose from "mongoose";

const CoachSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // القديم
    bio: String,
    specialties: [String],
    galleryUrls: [String],
    achievements: [String],
    certifications: [String],

    // الجديد: عشان يمشي مع /data/coaches و <Coaches.tsx>
    name: String, // display name
    title: String, // "Head Coach"
    specialization: String, // "Technical Director"
    experience: String, // "15+ years..."
    email: String,
    phone: String,
    gallery: [String], // صور إضافية
  },
  { timestamps: true }
);

const Coach = mongoose.model("Coach", CoachSchema);

export default Coach;
