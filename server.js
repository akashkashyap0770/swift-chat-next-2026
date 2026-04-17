const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// ✅ FIX: No more hardcoded Render URL.
// Set NEXT_PUBLIC_CLIENT_URL in Render's Environment Variables dashboard.
// e.g. https://your-app-name.onrender.com
const CLIENT_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL ||
  (isDev ? "http://localhost:3000" : null);

if (!CLIENT_URL) {
  throw new Error(
    "NEXT_PUBLIC_CLIENT_URL environment variable is not set. " +
      "Add it in your Render dashboard under Environment Variables.",
  );
}

const app = next({ dev: isDev });
const handleRequest = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handleRequest(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      // ✅ FIX: Dynamic — reads from env, no stale hardcoded URL
      origin: CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log("✅ New user connected, socket ID:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected, socket ID:", socket.id);
    });
  });

  // Make io available to API routes via global
  global.io = io;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Allowing connections from: ${CLIENT_URL}`);
  });
});
