import mongoose from "mongoose";
const LibrarySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["manual", "video", "philosophy", "guideline"],
    required: true,
  },
  title: String,
  description: String,
  lang: { type: String, enum: ["en", "ar"], default: "en" },
  category: String,
  fileUrl: String,
  videoUrl: String,
  contentHtml: String,
  isMembersOnly: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Library = mongoose.model("Library", LibrarySchema);

export default Library;
