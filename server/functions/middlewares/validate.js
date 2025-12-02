import { validationResult } from "express-validator";

export const validate = (rules = []) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details: errors.array(),
        },
      });
    }
    next();
  },
];
