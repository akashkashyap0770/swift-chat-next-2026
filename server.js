const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: dev ? "http://localhost:3000" : true,
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    path: "/api/socket.io", // Changed path to avoid conflicts
    transports: ["websocket", "polling"], // Try websocket first
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined room`);

        // Notify others that user is online
        socket.broadcast.emit("user-online", userId);
      }
    });

    socket.on("send-message", (data) => {
      console.log("📨 Message received:", data);
      // Broadcast to appropriate room
      if (data.receiverId) {
        io.to(data.receiverId).emit("new-message", data);
        io.to(data.senderId).emit("new-message", data);
      } else {
        io.emit("new-message", data);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  global.io = io;
  global.ioInstance = io;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://localhost:${port}`);
    console.log(`📡 Socket.io path: /api/socket.io`);
  });
});
