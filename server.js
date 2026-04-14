// server.js
//
// This file is the entry point for the server. Normally Next.js starts itself,
// but we need to add Socket.io to the same server — so we start it manually here.
//
// HOW TO RUN:
//   node server.js    (instead of next start / next dev)
//   In package.json, set:  "dev": "node server.js"
//
// WHY global.io?
//   We create io here, but the API routes (app/api/messages/route.js) also need it
//   to emit messages. We can't import it normally because they run in separate contexts.
//   Saving it as global.io makes it accessible from anywhere in the Node.js process.

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const isDev = process.env.NODE_ENV !== "production";
const app = next({ dev: isDev });

// app.getRequestHandler() returns a function that Next.js uses to handle
// incoming HTTP requests (pages, API routes, etc.)
const handleRequest = app.getRequestHandler();

app.prepare().then(() => {
  // Step 1: Create a plain HTTP server.
  // Every request is passed to Next.js to handle normally.
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handleRequest(req, res, parsedUrl);
  });

  // Step 2: Attach Socket.io to the same HTTP server.
  // Now both Next.js and Socket.io share port 3000.
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // allow any origin in development
      methods: ["GET", "POST"],
    },
  });

  // Step 3: Handle socket events.
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user logs in, their browser emits "join" with their userId.
    // We put them in a room named after their userId.
    // Later, when someone sends them a private message, we do:
    //   io.to(theirUserId).emit("new-message", ...)
    // ...and only they receive it.
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} is now in their room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Step 4: Save io on the global object so API routes can use it.
  // Without this, app/api/messages/route.js has no way to emit messages.
  global.io = io;

  // Step 5: Start listening on port 3000
  httpServer.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
