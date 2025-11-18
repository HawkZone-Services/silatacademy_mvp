import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

// Use process.env or Firebase Secret Manager (runtime)
const JWT_SECRET = process.env.JWT_SECRET;

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Connect to DB
    const db = await getDb("silatacademy"); // your DB name
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(decoded.id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT verification error:", error);
    }
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
});

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Not authorized, role missing or user not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied for role '${
          req.user.role
        }'. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
