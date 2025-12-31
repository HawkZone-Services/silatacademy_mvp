import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["image"],
      default: "image",
    },

    category: {
      type: String,
      enum: ["gallery", "certificate", "training", "event"],
      default: "gallery",
    },

    url: {
      type: String,
      required: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Media", MediaSchema);
