import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // Basic Identity
    name: { type: String, required: true, trim: true },

    email: { type: String, unique: true, sparse: true },
    // Email optional → لأن بعض الطلاب ممكن يدخلوا بالرقم القومي فقط

    nationalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: { type: String, required: true },

    gender: { type: String, enum: ["male", "female"], required: true },

    dob: { type: Date },

    phone: { type: String },

    avatarUrl: { type: String },

    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      default: "student",
    },

    isActive: { type: Boolean, default: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who created the student
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
