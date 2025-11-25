const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("../server/functions/node_modules/mongoose");

module.exports = async () => {
  // Load the backend .env so we reuse the same connection string the API uses.
  const envPath = path.join(__dirname, "..", "server", ".env");
  dotenv.config({ path: envPath });

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI not set; skipping mongoose bootstrap.");
    return;
  }

  mongoose.set("strictQuery", false);
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
    });
    global.__MONGOOSE_CONN__ = mongoose.connection;
    console.log("DB READY");
  } catch (err) {
    console.error("Mongoose connection failed", err?.message || err);
    throw err;
  }
};
