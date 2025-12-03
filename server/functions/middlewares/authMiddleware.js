// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { connectDB } from "../utils/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized, token missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Ensure DB connection using mongoose
    await connectDB();

    // Fetch user (mongoose)
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      beltLevel: user.beltLevel, // لو محتاجها في eligibility
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
});

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({
        message: "Not authorized, user not authenticated",
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
