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
      origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  global.io = io;

  server.listen(port, () => {
    console.log(`🚀 Server started at http://localhost:${port}`);
  });
});
