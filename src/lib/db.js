// Connects to MongoDB
// Uses a cached connection so we don't reconnect on every API request

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in your .env.local file");
}

// Cache the connection globally so it survives across hot reloads in dev
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function connectDB() {
  // If already connected
  if (cached.conn) {
    console.log("🟢 MongoDB already connected");
    return cached.conn;
  }

  // If connection is in progress
  if (!cached.promise) {
    console.log("🟡 Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);

    cached.promise = null; // reset so next call tries again
    throw error;
  }

  return cached.conn;
}

export default connectDB;
