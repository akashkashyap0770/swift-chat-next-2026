# 💬 SwiftChat – Full Stack Real-Time Chat App

A modern, fully responsive **Full Stack Real-Time Chat Application** built using **Next.js + MongoDB + Socket.io + JWT Authentication + Tailwind CSS**.  
This project includes global chat, private direct messaging, live online status, and secure cookie-based authentication — all in a single Next.js project with a custom Node.js server.

---

## 🚀 Demo

🔗 **Live Website:** https://swift-chat-next-2026.onrender.com  
🔗 **GitHub Repository:** https://github.com/akashkashyap0770/swift-chat-next-2026

---

## 🛠 Tech Stack

- ⚡ Next.js 15 (App Router)
- 🍃 MongoDB + Mongoose
- 🔐 JWT (JSON Web Tokens) + HTTP-only Cookies
- 🔴 Socket.io (Real-Time Messaging)
- 🎨 Tailwind CSS
- 🔔 React Hot Toast
- 🌐 Custom Node.js Server (`server.js`)

---

## 📌 Key Features

- ✅ Full Stack — Frontend + Backend in one project (No separate Express server)
- ✅ User Authentication (Register, Login, Logout) via JWT + HTTP-only Cookies
- ✅ Real-Time Messaging with **Socket.io** (no page refresh needed)
- ✅ **Global Chat** — visible to all connected users
- ✅ **Private Direct Messages** — 1-on-1 chat between users
- ✅ Live **Online / Offline** status indicators
- ✅ Duplicate message prevention (socket echo deduplication)
- ✅ Auto-scroll to latest message
- ✅ Protected Routes via Next.js Middleware
- ✅ Persistent sessions via HTTP-only cookies (7-day expiry)
- ✅ Fully Responsive Layout

---

## 📁 Project Structure

```
├── app/
│   ├── page.js                  # Root redirect (chat or login)
│   ├── login/                   # Login page
│   ├── register/                # Register page
│   ├── chat/                    # Main chat page (protected)
│   └── api/
│       ├── auth/
│       │   ├── login/           # POST – login user
│       │   ├── register/        # POST – register user
│       │   ├── logout/          # POST – logout user
│       │   └── me/              # GET  – get current user
│       ├── messages/            # GET & POST messages
│       └── users/               # GET all users (except self)
│
├── components/
│   ├── Navbar.jsx               # Top navigation bar
│   ├── SideBar.jsx              # User list + chat selector
│   ├── ChatWindow.jsx           # Messages display + send
│   ├── MessageBubble.jsx        # Single message bubble
│   └── SendMessageForm.jsx      # Message input bar
│
├── context/
│   ├── AuthContext.js           # Auth state (user, login, logout)
│   └── SocketContext.js         # Socket.io connection + provider
│
├── lib/
│   ├── db.js                    # MongoDB connection (cached)
│   ├── jwt.js                   # signToken / verifyToken helpers
│   └── socket.js                # Socket.io server setup
│
├── models/
│   ├── user.js                  # User Mongoose schema
│   └── message.js               # Message Mongoose schema
│
├── middleware.js                # Route protection (Next.js middleware)
└── server.js                    # Custom Node.js + Socket.io server
```

---

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |
| POST | `/api/auth/logout` | Logout and clear cookie |
| GET | `/api/auth/me` | Get currently logged-in user |
| GET | `/api/users` | Get all users except self |
| GET | `/api/messages` | Fetch global chat messages |
| GET | `/api/messages?userId=X` | Fetch private messages with user X |
| POST | `/api/messages` | Send a new message (saved + emitted via socket) |

---

## ⚡ How Real-Time Works

```
User A sends a message
        │
        ▼
POST /api/messages  →  Saved to MongoDB
        │
        ▼
global.io.emit("new-message")   ← Socket.io server (server.js)
        │
   ┌────┴────┐
   ▼         ▼
User A    User B
(echo)   (instant delivery)
```

- Each user joins a **private Socket.io room** named after their `userId` on login
- Private messages are emitted to both sender and receiver rooms
- Global messages are broadcast to **all** connected sockets
- Duplicate messages are filtered client-side using `_id` comparison

---

## 🚀 Installation & Setup

Clone the repo:
```bash
git clone https://github.com/akashkashyap0770/swift-chat-next-2026.git
cd swift-chat-next-2026
```

Install dependencies:
```bash
npm install
```

Create `.env.local` file in root:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start development server:
```bash
node server.js
```

> ⚠️ **Important:** Use `node server.js` instead of `npm run dev` — the custom server is required for Socket.io to work.

Build for production:
```bash
npm run build
node server.js
```

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign/verify JWT tokens |
| `PORT` | (Optional) Server port — defaults to `3000` |

---

## 🗄️ Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Display name |
| `email` | String | Unique email |
| `password` | String | Bcrypt hashed |
| `username` | String | Unique username |
| `isOnline` | Boolean | Online status |

### Message
| Field | Type | Description |
|-------|------|-------------|
| `sender` | ObjectId | Ref to User |
| `receiver` | ObjectId | Ref to User (null = global) |
| `content` | String | Message text |
| `createdAt` | Date | Timestamp |

---

## ☁️ Deployment

> Since this app uses a **custom Node.js server** (`server.js`) for Socket.io, it cannot be deployed on Vercel (serverless). Use a platform that supports persistent Node.js processes.

**Recommended platforms:**
- 🟢 [Render](https://render.com) — free tier available
- 🔵 [Railway](https://railway.app)
- 🟠 [Fly.io](https://fly.io)

**Start command for deployment:**
```bash
node server.js
```

---

## 👨‍💻 Author

**Akash Kashyap**  
🔗 Portfolio: https://a-portfolio-2025.netlify.app/  
🔗 GitHub: https://github.com/akashkashyap0770
