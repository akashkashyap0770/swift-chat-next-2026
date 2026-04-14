// User model — defines the shape of a user in MongoDB

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  isOnline: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model re-registration in dev (Next.js hot reload)
export default mongoose.models.User || mongoose.model("User", UserSchema);
