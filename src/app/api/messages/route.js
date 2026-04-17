export const runtime = "nodejs";

// app/api/messages/route.js
//
// GET  /api/messages          → fetch all global chat messages
// GET  /api/messages?userId=X → fetch private messages with user X
// POST /api/messages          → save a new message + push it via socket
//
// ABOUT global.io:
//   server.js creates the Socket.io server and saves it as global.io.
//   "global" in Node.js is like window in the browser — it's available everywhere.
//   API routes can't import the socket directly (they run in a different context),
//   so we store it on global in server.js and read it here with global.io.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Message from "@/models/message";
import User from "@/models/user";

// ─────────────────────────────────────────────────────────────
// Helper: get the logged-in user from the JWT cookie
// ─────────────────────────────────────────────────────────────
async function getLoggedInUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null; // no cookie = not logged in

    // Decode the token to get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    // Fetch full user from DB (excluding the password field)
    return await User.findById(decoded.userId).select("-password");
  } catch {
    return null; // invalid token
  }
}

// ─────────────────────────────────────────────────────────────
// GET — fetch messages
// ─────────────────────────────────────────────────────────────
export async function GET(request) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Check if a userId was passed in the URL (e.g. /api/messages?userId=abc123)
  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get("userId");

  let messages;

  if (otherUserId) {
    // Private chat: find messages sent between me and the other user (in either direction)
    messages = await Message.find({
      $or: [
        { sender: user._id, receiver: otherUserId }, // I sent to them
        { sender: otherUserId, receiver: user._id }, // they sent to me
      ],
    })
      .populate("sender", "name email") // replace sender ID with full user object
      .populate("receiver", "name email") // same for receiver
      .sort({ createdAt: 1 }); // oldest first
  } else {
    // Global chat: messages where receiver is null (sent to everyone)
    messages = await Message.find({ receiver: null })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
  }

  return NextResponse.json(messages);
}

// ─────────────────────────────────────────────────────────────
// POST — send a new message
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId, content } = await request.json();

  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Message content is required" },
      { status: 400 },
    );
  }

  await connectDB();

  // Save the message to MongoDB
  const newMessage = await Message.create({
    sender: user._id,
    receiver: receiverId || null, // null = global chat
    content: content.trim(),
  });

  // Fetch it back with sender/receiver names filled in (not just IDs)
  const fullMessage = await Message.findById(newMessage._id)
    .populate("sender", "name email")
    .populate("receiver", "name email");

  // Push the message via Socket.io so recipients see it instantly.
  // global.io is the Socket.io server instance, saved in server.js.
  const io = global.io;

  if (io) {
    if (receiverId) {
      // Private message: send to the recipient's room AND back to the sender's room.
      // Each user joins a room named after their userId (see SocketContext.js → emit "join").
      io.to(receiverId).emit("new-message", fullMessage); // send to recipient
      io.to(user._id.toString()).emit("new-message", fullMessage); // echo back to sender
    } else {
      // Global message: send to everyone connected
      io.emit("new-message", fullMessage);
    }
  }

  return NextResponse.json(fullMessage, { status: 201 });
}
