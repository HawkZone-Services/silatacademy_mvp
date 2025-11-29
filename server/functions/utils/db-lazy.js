import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { defineSecret } from "firebase-functions/params";

const MONGO_URI = defineSecret("MONGO_URI");

const resolveMongoUri = async () =>
  process.env.MONGO_URI ||
  (typeof MONGO_URI === "string" ? MONGO_URI : await MONGO_URI.value());

let cachedClient = null;
let cachedDb = null;
let mongooseReady = null;

export async function connectDB(dbName = "silatacademy") {
  try {
    // Secrets in emulator may come from .env; prefer env fallback before Secret Manager
    const mongoUri = await resolveMongoUri();
    if (!mongoUri) throw new Error("Missing MONGO_URI secret");

    if (!cachedDb) {
      const client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      cachedClient = await client.connect();
      cachedDb = cachedClient.db(dbName);
      console.log("MongoDB Connected via Lazy Init (MongoClient)");
    }

    if (!mongooseReady) {
      mongoose.set("strictQuery", false);
      mongooseReady = mongoose.connect(mongoUri, { dbName });
      await mongooseReady;
      console.log("MongoDB Connected via Lazy Init (Mongoose)");
    }

    return cachedDb;
  } catch (err) {
    console.error("DB Connection Error", err);
    throw err;
  }
}
