// Utility functions for creating and verifying JWT tokens
// A JWT token is like a secure "ID card" stored in a cookie

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// Create a token with user info inside it, valid for 7 days
export const signToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

// Verify a token and return its payload (or null if invalid)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null; // token is expired or tampered with
  }
};
