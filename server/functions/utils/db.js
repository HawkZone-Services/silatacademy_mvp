// utils/db.js
import mongoose from "mongoose";
import { defineSecret } from "firebase-functions/params";

export const MONGO_URI = defineSecret("MONGO_URI");

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const uri =
    process.env.MONGO_URI ||
    (typeof MONGO_URI === "string" ? MONGO_URI : await MONGO_URI.value());

  if (!uri) throw new Error("❌ Missing MONGO_URI secret");

  mongoose.set("strictQuery", false);

  cachedConnection = mongoose
    .connect(uri, {
      dbName: "silatacademy",
      maxPoolSize: 5,
    })
    .then((conn) => {
      console.log("🔥 Mongoose connected");
      return conn;
    })
    .catch((err) => {
      console.error("❌ Mongoose connection error:", err);
      throw err;
    });

  return cachedConnection;
}
