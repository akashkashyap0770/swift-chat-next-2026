const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// Get the actual Render URL
const CLIENT_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL ||
  (isDev
    ? "http://localhost:3000"
    : "https://swift-chat-next-2026.onrender.com");

const app = next({ dev: isDev });
const handleRequest = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handleRequest(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
    transports: ["polling", "websocket"], // Match client
  });

  io.on("connection", (socket) => {
    console.log("✅ Naya user connect hua, socket ID:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log("👤 User " + userId + " apne room mein join ho gaya");
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnect ho gaya, socket ID:", socket.id);
    });
  });

  global.io = io;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai on port ${PORT}`);
    console.log(`📍 Client URL: ${CLIENT_URL}`);
  });
});
