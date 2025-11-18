import { MongoClient } from "mongodb";
import { defineSecret } from "firebase-functions/params";

const MONGO_URI = defineSecret("MONGO_URI");

const getMongoUri = async () =>
  typeof MONGO_URI === "string" ? MONGO_URI : await MONGO_URI.value();

let cachedClient = null;

export async function getDb(dbName = "silatacademy") {
  const uri = await getMongoUri();
  if (!uri) throw new Error("❌ MONGO_URI is not defined");

  if (!cachedClient) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    cachedClient = await client.connect();
  }

  return cachedClient.db(dbName);
}
