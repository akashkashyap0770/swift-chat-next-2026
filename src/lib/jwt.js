import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export const signToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};
