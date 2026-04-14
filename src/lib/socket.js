// lib/socket.js
// This file creates and manages the Socket.io server
// It runs on the backend (Node.js server side)

import { Server } from "socket.io";

// We store the io instance globally so it's reused across requests
// (Next.js hot reloads can create multiple instances otherwise)
let io;

export function getSocketServer(httpServer) {
  if (!io) {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // Allow all origins in development
        methods: ["GET", "POST"],
      },
    });

    // This runs when a client (browser) connects
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Client tells us which userId they are
      // So we can send them messages directly
      socket.on("join", (userId) => {
        // Each user joins a "room" named after their userId
        // This lets us send private messages to specific users
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      // Client disconnects (closes tab, logs out)
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  return io;
}

export { io };
