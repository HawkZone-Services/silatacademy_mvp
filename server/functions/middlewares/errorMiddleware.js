import { httpError } from "../utils/validation.js";

export const notFound = (req, res, next) => {
  next(httpError(404, "Route not found"));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const error = {
    message: err.message || "Internal server error",
    code: err.code || statusCode,
  };

  if (err.details) {
    error.details = err.details;
  }

  if (process.env.NODE_ENV !== "production") {
    // Provide stack only during development
    error.stack = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    error,
  });
};
