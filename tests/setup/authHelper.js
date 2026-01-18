import jwt from "jsonwebtoken";

export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const decodeToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
