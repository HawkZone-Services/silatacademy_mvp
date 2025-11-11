import * as functions from "firebase-functions/v2";
import express from "express";
import passport from "passport";
import cookieSession from "cookie-session";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

//Middlewaars
//زيادة حد البيانات المرسلة
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// أمان وتحسين الأداء
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

// إعداد الكوكيز سيشن
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);
app.use(passport.initialize());
app.use(passport.session());

// CORS مع دعم النطاقات الديناميكية
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
      origin.trim().replace(/\/$/, "")
    )
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.error(`❌ CORS Error: ${origin} not allowed`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// API Routes

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running smoothly" });
});

// Error Handling Middleware
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// تصدير كـ Firebase Function مع تخصيص الموارد والأسرار
export const api = functions.https.onRequest(
  {
    secrets: [],
    cpu: 1, // 1 CPU
    memory: "512MiB", // 512 MB RAM
    maxInstances: 3, // Optional: limit max instances
    timeoutSeconds: 60, // Optional: timeout
    ingressSettings: "ALLOW_ALL", // Optional: network ingress
  },
  app
);
