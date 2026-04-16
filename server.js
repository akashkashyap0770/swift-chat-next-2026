// ─────────────────────────────────────────────
// server.js
// Yeh file poora server start karti hai.
// Next.js + Socket.io dono ek saath chalte hain.
// Command: node server.js
// ─────────────────────────────────────────────

// Step 1: Zaroori cheezein import karo

// 'http' module se basic HTTP server banate hain
const { createServer } = require("http");

// 'url' module se URL parse karte hain (query params etc.)
const { parse } = require("url");

// Next.js framework import karo
const next = require("next");

// Socket.io — real-time messaging ke liye
const { Server } = require("socket.io");

// ─────────────────────────────────────────────
// Step 2: Settings decide karo
// ─────────────────────────────────────────────

// Agar NODE_ENV "production" hai to isDev = false
// Development mein isDev = true (hot reload etc. milta hai)
const isDev = process.env.NODE_ENV !== "production";

// PORT: Render apna port deta hai, warna 3000 use karo locally
// process.env.PORT = Render ka port (usually 10000)
// || 3000 = agar PORT nahi mila to 3000 use karo (local development)
const PORT = process.env.PORT || 3000;

// Next.js app banao
const app = next({ dev: isDev });

// Next.js ka request handler — yeh har HTTP request handle karta hai
// (pages, API routes, images, etc. sab yahi handle karta hai)
const handleRequest = app.getRequestHandler();

// ─────────────────────────────────────────────
// Step 3: Server start karo
// app.prepare() Next.js ko ready karta hai (build load karta hai)
// Jab ready ho jaye tab server start hota hai
// ─────────────────────────────────────────────
app.prepare().then(() => {
  // ── HTTP Server banao ──────────────────────────
  // Har incoming request Next.js ko de do handle karne ke liye
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handleRequest(req, res, parsedUrl);
  });

  // ── Socket.io same server pe lagao ────────────
  // Ab ek hi port pe dono kaam karenge:
  // - Next.js: normal pages aur API routes
  // - Socket.io: real-time messages
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Kisi bhi domain se connection allow karo
      methods: ["GET", "POST"],
    },
  });

  // ── Socket Events ─────────────────────────────
  // Jab koi user browser mein app khole, socket connect hota hai
  io.on("connection", (socket) => {
    console.log("✅ Naya user connect hua, socket ID:", socket.id);

    // Browser "join" event bhejta hai apna userId lekar
    // Hum us user ko unke userId ke naam ke ek room mein daaldo
    // Isse private messages sirf unhe milenge
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log("👤 User " + userId + " apne room mein join ho gaya");
    });

    // Jab user tab band kare ya logout kare
    socket.on("disconnect", () => {
      console.log("❌ User disconnect ho gaya, socket ID:", socket.id);
    });
  });

  // ── global.io kyun? ───────────────────────────
  // API route (app/api/messages/route.js) ko bhi socket chahiye
  // taaki message save hone ke baad turant sabko bhej sake.
  // global = poore Node.js process mein accessible (jaise window browser mein)
  // Isliye yahan save karte hain, API route wahan se padh leta hai.
  global.io = io;

  // ── Server suno PORT pe ───────────────────────
  httpServer.listen(PORT, () => {
    console.log("🚀 Server chal raha hai: http://localhost:" + PORT);
  });
});
