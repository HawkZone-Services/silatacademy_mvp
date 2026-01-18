import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import app from "./app.js";

export const api = onRequest(
  {
    secrets: ["MONGO_URI", "JWT_SECRET"],
    timeoutSeconds: 60,
    memory: "512MiB",
    cpu: 1,
    maxInstances: 5,
    cors: true,
  },
  (req, res) => {
    try {
      // 🔥 REQUIRED FOR MULTER (Firebase v2)
      req.rawBody = req.rawBody || Buffer.from([]);
      return app(req, res);
    } catch (err) {
      logger.error("Unhandled API Error", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
