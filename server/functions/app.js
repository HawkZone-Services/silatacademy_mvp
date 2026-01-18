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
// Lazy DB Init
// =============
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Init Error", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// =======================
// BODY PARSING
// =======================
app.use(express.json({ limit: "10mb" }));

// Security
app.use(helmet());

// Logger
app.use(morgan("combined"));

// =======================
// SESSION
// =======================
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "fallback"],
    maxAge: 24 * 60 * 60 * 1000,
    secure: false, // local / emulator
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(passport.initialize());
app.use(passport.session());

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://192.168.1.2:8080",
      "https://silatacademy.net",
    ],
    credentials: true,
  })
);

// =======================
// ROUTES
// =======================
app.use("/api", router);

// =======================
// RESPONSE COMPRESSION
// =======================
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["content-type"]?.startsWith("multipart/")) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API running" });
});

// =======================
// ERRORS
// =======================
app.use(notFound);
app.use(errorHandler);

export default app;
