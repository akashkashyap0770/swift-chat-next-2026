// Message model — defines the shape of a message in MongoDB

import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  // Who sent the message (links to User)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Who receives it (null = global chat, everyone sees it)
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
