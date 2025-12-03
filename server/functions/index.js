import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import express from "express";
import passport from "passport";
import cookieSession from "cookie-session";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/index.js";

import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { connectDB } from "./utils/db.js";
dotenv.config();

const app = express();

// =============
//  Lazy DB Init
// =============
app.use(async (req, res, next) => {
  try {
    await connectDB(); // ❗ يربط الـ DB فقط عند الطلب وليس قبل ذلك
    next();
  } catch (err) {
    logger.error("DB Init Error", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// =======
// Middlewares
// =======
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

// =======
// SESSION
// =======
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "fallback"],
    maxAge: 24 * 60 * 60 * 1000,
    secure: false, // emulator only
    httpOnly: true,
    sameSite: "lax",
  })
);
app.use(passport.initialize());
app.use(passport.session());

// =======
// CORS
// =======
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://192.168.1.2:8080",
      "https://silatacademy.net",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =======
// ROUTES
// =======
app.use("/api", router);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API running" });
});

// =======
// ERROR HANDLERS
// =======
app.use(notFound);
app.use(errorHandler);

// =======
// EXPORT FUNCTION
// =======
export const api = onRequest(
  {
    secrets: ["MONGO_URI", "JWT_SECRET"],
    timeoutSeconds: 60,
    memory: "512MiB",
    cpu: 1,
    maxInstances: 5,
  },
  app
);
