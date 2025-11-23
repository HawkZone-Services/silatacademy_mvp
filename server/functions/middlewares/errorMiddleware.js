import { httpError } from "../utils/validation.js";

export const notFound = (req, res, next) => {
  next(httpError(404, "Route not found"));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production") {
    // Provide stack only during development
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
