username: akashkashyap0770_db_user
password: BQPznFLODmu7dgAk
MONGODB_URI=mongodb://akashkashyap0770_db_user:BQPznFLODmu7dgAk@ac-x6yfbvb-shard-00-00.hxpwf03.mongodb.net:27017,ac-x6yfbvb-shard-00-01.hxpwf03.mongodb.net:27017,ac-x6yfbvb-shard-00-02.hxpwf03.mongodb.net:27017/?ssl=true&replicaSet=atlas-3kerm0-shard-0&authSource=admin&appName=Cluster0

<!-- -------------------------------------------------------------------------------------------------- -->

# 💬 ChatApp — Real-time Messaging App

A full-stack **Real-time Chat Application** built with **Next.js + MongoDB + Custom JWT Authentication**.  
Features global chat, private messaging, and online/offline status — without any third-party auth library.

---

## 🚀 Demo

🔗 **Live Website:** (Vercel par deploy karne ke baad add karo)  
🔗 **GitHub Repository:** (GitHub par push karne ke baad add karo)

---

## 🛠 Tech Stack

- ⚡ Next.js 15 (App Router)
- 🍃 MongoDB + Mongoose
- 🔐 Custom JWT Authentication (jsonwebtoken + bcryptjs)
- 🎨 Tailwind CSS
- 🔔 React Hot Toast
- 🔄 Polling (Auto message refresh every 3s)

---

## 📌 Key Features

- ✅ Register & Login with JWT (HTTP-only cookies)
- ✅ Password Hashing with bcrypt
- ✅ Protected Routes (Middleware)
- ✅ Global Chat (sabko message karo)
- ✅ Private Messaging (direct message)
- ✅ Online / Offline Status
- ✅ Auto-scroll to latest message
- ✅ Real-time feel with Polling (3s interval)
- ✅ Fully Responsive Layout

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js                    # / → /chat redirect
│   ├── layout.js                  # Root layout
│   ├── (auth)/
│   │   ├── login/page.js          # Login page
│   │   └── register/page.js       # Register page
│   ├── chat/page.js               # Main chat page
│   └── api/
│       ├── auth/
│       │   ├── register/route.js  # POST - Register
│       │   ├── login/route.js     # POST - Login
│       │   └── logout/route.js    # POST - Logout
│       ├── messages/route.js      # GET + POST messages
│       └── users/route.js         # GET all users
├── components/
│   ├── Navbar.js                  # Top bar
│   ├── Sidebar.js                 # Users list
│   ├── ChatWindow.js              # Messages area
│   ├── MessageBubble.js           # Single message UI
│   └── SendMessageForm.js         # Input + send
├── context/
│   └── AuthContext.js             # Global auth state
├── lib/
│   ├── db.js                      # MongoDB connection
│   └── jwt.js                     # Token sign/verify
└── models/
    ├── User.js                    # User schema
    └── Message.js                 # Message schema
middleware.js                      # Route protection
```

---

## 🔌 API Routes

| Method | Endpoint                      | Description               |
| ------ | ----------------------------- | ------------------------- |
| POST   | `/api/auth/register`          | Register new user         |
| POST   | `/api/auth/login`             | Login + set JWT cookie    |
| POST   | `/api/auth/logout`            | Logout + clear cookie     |
| GET    | `/api/users`                  | Get all users (except me) |
| GET    | `/api/messages`               | Get global messages       |
| GET    | `/api/messages?receiverId=id` | Get private messages      |
| POST   | `/api/messages`               | Send a message            |

---

## 🚀 Installation & Setup

Clone the repo:

```bash
git clone https://github.com/yourusername/chat-app.git
```

Install dependencies:

```bash
npm install
```

Create `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
```

Start dev server:

```bash
npm run dev
```

---

## 🔐 How JWT Auth Works

```
1. User registers → password bcrypt se hash hota hai → DB mein save
2. Login → password verify → JWT token banta hai
3. Token HTTP-only cookie mein save hota hai (JS access nahi kar sakta)
4. Har API request par cookie automatic jaati hai
5. Middleware token verify karta hai → protected routes guard hote hain
6. Logout → cookie delete → user offline mark hota hai
```

---

## ☁️ Deployment

Vercel par deploy karo aur yeh env variables add karo:

```
MONGODB_URI = your_mongodb_uri
JWT_SECRET  = your_jwt_secret
```

---

## 👨‍💻 Author

**Akash Kashyap**  
🔗 Portfolio: https://a-portfolio-2025.netlify.app/  
🔗 GitHub: https://github.com/akashkashyap0770

<!-- ------------------------------------------------------------------------------------------ -->

```javascript

// 🏗️ app/layout.js — Root layout — har page ko wrap karta hai



import { Geist } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "react-hot-toast";



const geist = Geist({ subsets: ["latin"] });



export const metadata = {

  title: "ChatApp — Real-time Messaging",

  description: "A real-time chat application built with Next.js and JWT auth",

};



export default function RootLayout({ children }) {

  return (

    <html lang="en">

      <body className={`${geist.className} bg-gray-950 text-white`}>

        {/* AuthProvider: User state poore app mein available */}

        <AuthProvider>

          <Toaster position="top-center" />

          {children}

        </AuthProvider>

      </body>

    </html>

  );

}





// 🏠 app/page.js — Home page

// Seedha /chat par redirect karta hai

// Middleware handle karega — login nahi hai toh /login jayega



import { redirect } from "next/navigation";



export default function Home() {

  redirect("/chat");

}





"use client";



// 💬 app/chat/page.js — Main Chat Page

// Yahan Navbar + Sidebar + ChatWindow teeno ek saath dikhte hain

// Sidebar se user select karo → ChatWindow mein messages dikhe



import { useState } from "react";

import Navbar from "@/components/Navbar";

import Sidebar from "@/components/SideBar";

import ChatWindow from "@/components/ChatWindow";

import { useAuth } from "@/context/AuthContext";



export default function ChatPage() {

  // Abhi kaun selected hai sidebar mein

  // null = Global Chat, object = koi user

  const [selectedUser, setSelectedUser] = useState(null);



  const { loading } = useAuth();



  // Auth check ho raha hai — wait karo

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-950 flex items-center justify-center">

        <p className="text-gray-400 text-lg">Loading...</p>

      </div>

    );

  }



  return (

    // Poora screen height use karo — flex column

    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">

      {/* 🔝 TOP: Navbar — full width */}

      <Navbar />



      {/* BOTTOM: Sidebar + ChatWindow side by side */}

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Users list sidebar */}

        <Sidebar

          selectedUser={selectedUser}

          onSelectUser={setSelectedUser} // User click hone par update karo

        />



        {/* RIGHT: Messages area */}

        <ChatWindow selectedUser={selectedUser} />

      </div>

    </div>

  );

}



"use client";



// 📝 app/(auth)/register/page.js — Register page

// Naya user account banata hai

// Success hone par /chat par redirect



import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import Link from "next/link";

import toast from "react-hot-toast";



export default function RegisterPage() {

  // Form fields ki state

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);



  const router = useRouter();

  const { login } = useAuth(); // Context se login function



  const handleRegister = async (e) => {

    e.preventDefault(); // Page reload mat karo



    // Basic validation

    if (!name.trim() || !email.trim() || !password.trim()) {

      toast.error("All fields are required");

      return;

    }



    if (password.length < 6) {

      toast.error("Password must be at least 6 characters");

      return;

    }



    setLoading(true);



    try {

      const res = await fetch("/api/auth/register", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ name, email, password }),

      });



      const data = await res.json();



      if (!res.ok) {

        toast.error(data.error || "Registration failed");

        return;

      }



      // Context mein user save karo

      login(data.user);

      toast.success("Account created! Welcome 🎉");

      router.push("/chat"); // Chat page par jao

    } catch (error) {

      console.log("Register error:", error);

      toast.error("Something went wrong");

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">

        {/* Header */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-white">💬 ChatApp</h1>

          <p className="text-gray-400 mt-2">Create your account</p>

        </div>



        {/* Form */}

        <form onSubmit={handleRegister} className="space-y-4">

          <input

            type="text"

            placeholder="Your Name"

            value={name}

            onChange={(e) => setName(e.target.value)}

            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"

          />



          <input

            type="email"

            placeholder="Email Address"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"

          />



          <input

            type="password"

            placeholder="Password (min 6 characters)"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"

          />



          <button

            type="submit"

            disabled={loading}

            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"

          >

            {loading ? "Creating account..." : "Create Account"}

          </button>

        </form>



        {/* Login link */}

        <p className="text-center text-gray-400 mt-6">

          Already have an account?{" "}

          <Link href="/login" className="text-blue-400 hover:underline">

            Login

          </Link>

        </p>

      </div>

    </div>

  );

}



"use client";



// 🔐 app/(auth)/login/page.js — Login page

// Existing user login karta hai

// Success hone par /chat par redirect



import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import Link from "next/link";

import toast from "react-hot-toast";



export default function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);



  const router = useRouter();

  const { login } = useAuth();



  const handleLogin = async (e) => {

    e.preventDefault();



    if (!email.trim() || !password.trim()) {

      toast.error("Email and password are required");

      return;

    }



    setLoading(true);



    try {

      const res = await fetch("/api/auth/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password }),

      });



      const data = await res.json();



      if (!res.ok) {

        toast.error(data.error || "Login failed");

        return;

      }



      // Context mein user save karo

      login(data.user);

      toast.success(`Welcome back, ${data.user.name}! 👋`);

      router.push("/chat");

    } catch (error) {

      console.log("Login error:", error);

      toast.error("Something went wrong");

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">

        {/* Header */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-white">💬 ChatApp</h1>

          <p className="text-gray-400 mt-2">Welcome back!</p>

        </div>



        {/* Form */}

        <form onSubmit={handleLogin} className="space-y-4">

          <input

            type="email"

            placeholder="Email Address"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"

          />



          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            // Enter press karne par bhi login ho

            onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}

            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"

          />



          <button

            type="submit"

            disabled={loading}

            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"

          >

            {loading ? "Logging in..." : "Login"}

          </button>

        </form>



        {/* Register link */}

        <p className="text-center text-gray-400 mt-6">

          Don't have an account?{" "}

          <Link href="/register" className="text-blue-400 hover:underline">

            Register

          </Link>

        </p>

      </div>

    </div>

  );

}



"use client";



// 🔝 components/Navbar.js — Top bar

// App ka naam, logged-in user ka naam, logout button



import { useAuth } from "@/context/AuthContext";



export default function Navbar() {

  const { user, logout } = useAuth();



  return (

    <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">

      {/* App name + logo */}

      <h1 className="text-xl font-bold text-white">💬 ChatApp</h1>



      {/* Right side: User info + Logout */}

      <div className="flex items-center gap-4">

        {user && (

          <>

            {/* User ka naam aur avatar (initials se) */}

            <div className="flex items-center gap-2">

              {/* Avatar: naam ka pehla letter dikhao */}

              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">

                {user.name?.charAt(0).toUpperCase()}

              </div>

              <span className="text-gray-300 text-sm hidden md:block">

                {user.name}

              </span>

            </div>



            {/* Logout button */}

            <button

              onClick={logout}

              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"

            >

              Logout

            </button>

          </>

        )}

      </div>

    </div>

  );

}





// 💬 components/MessageBubble.js — Ek message ka UI

// Right side = mera message (blue)

// Left side = doosre ka message (gray)



export default function MessageBubble({ message, isOwn }) {

  // Time format karo — "2:30 PM"

  const time = new Date(message.createdAt).toLocaleTimeString("en-IN", {

    hour: "2-digit",

    minute: "2-digit",

  });



  return (

    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>

      <div

        className={`max-w-xs md:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}

      >

        {/* Sender ka naam — sirf doosre ke messages mein dikhao */}

        {!isOwn && (

          <span className="text-xs text-gray-400 mb-1 ml-1">

            {message.senderName}

          </span>

        )}



        {/* Message bubble */}

        <div

          className={`px-4 py-2 rounded-2xl text-sm ${

            isOwn

              ? "bg-blue-600 text-white rounded-br-sm" // Mera message — blue, right

              : "bg-gray-700 text-white rounded-bl-sm" // Doosre ka — gray, left

          }`}

        >

          {message.text}

        </div>



        {/* Time */}

        <span className="text-xs text-gray-500 mt-1 mx-1">{time}</span>

      </div>

    </div>

  );

}



"use client";



// ✏️ components/SendMessageForm.js — Message likhne aur bhejne ka input

// Enter press ya Send button click karne par message bhejta hai



import { useState } from "react";



export default function SendMessageForm({ onSend, disabled }) {

  // Input field ki value

  const [text, setText] = useState("");



  // Message send karo

  const handleSend = () => {

    // Empty message mat bhejo

    if (!text.trim() || disabled) return;



    onSend(text.trim()); // Parent component ko message bhejo

    setText(""); // Input clear karo

  };



  return (

    <div className="p-4 bg-gray-900 border-t border-gray-800">

      <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-2">

        {/* Text input */}

        <input

          type="text"

          placeholder="Type a message..."

          value={text}

          onChange={(e) => setText(e.target.value)}

          // Enter press karne par send karo

          onKeyDown={(e) => e.key === "Enter" && handleSend()}

          disabled={disabled}

          className="flex-1 bg-transparent text-white outline-none placeholder-gray-500 text-sm"

        />



        {/* Send button */}

        <button

          onClick={handleSend}

          disabled={!text.trim() || disabled}

          className="text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition font-semibold text-sm"

        >

          Send ➤

        </button>

      </div>

    </div>

  );

}





// 🔑 lib/jwt.js — JWT token banana aur verify karna

// JWT = JSON Web Token — ek encrypted string jo user ki identity store karta hai

// Example token: "eyJhbGc..." — andar user ka ID hota hai



import jwt from "jsonwebtoken";



// Yeh secret key token ko sign karti hai — kisi ko pata nahi hona chahiye

const SECRET = process.env.JWT_SECRET;



// ✅ Token banana — login ke waqt call hota hai

// payload = { userId, name } — jo data token mein store karna hai

export const signToken = (payload) => {

  return jwt.sign(

    payload,

    SECRET,

    { expiresIn: "7d" }, // Token 7 din baad expire hoga

  );

};



// ✅ Token verify karna — protected routes mein call hota hai

// token = browser ki cookie se aaya hua string

export const verifyToken = (token) => {

  try {

    // Agar token valid hai toh decoded data return karega

    // Agar invalid/expired hai toh error throw karega

    return jwt.verify(token, SECRET);

  } catch (error) {

    return null; // Invalid token = null return karo

  }

};



// 🗄️ lib/db.js — MongoDB se connection banana

// Cached connection use karte hain taaki har request par naya connection na bane



import mongoose from "mongoose";



let cached = global.mongoose;



if (!cached) {

  cached = global.mongoose = { conn: null, promise: null };

}



export const connectDB = async () => {

  // Pehle se connected hai toh wohi return karo

  if (cached.conn) return cached.conn;



  if (!cached.promise) {

    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => {

      console.log("✅ MongoDB Connected");

      return m;

    });

  }



  cached.conn = await cached.promise;

  return cached.conn;

};



// 👤 models/User.js — User ka MongoDB schema

// Har registered user ka data yahan store hoga



import mongoose from "mongoose";



const userSchema = new mongoose.Schema(

  {

    // User ka naam — register karte waqt deta hai

    name: {

      type: String,

      required: true,

      trim: true, // Extra spaces remove karta hai

    },



    // Unique email — login ke liye use hoga

    email: {

      type: String,

      required: true,

      unique: true,  // Ek email ek baar hi register ho sakti hai

      lowercase: true, // Hamesha lowercase mein save karo

    },



    // Hashed password — kabhi plain text save mat karo

    password: {

      type: String,

      required: true,

    },



    // Profile avatar — UI mein initials se banayenge (A, B, C...)

    avatar: {

      type: String,

      default: "", // Default empty

    },



    // User abhi online hai ya nahi

    isOnline: {

      type: Boolean,

      default: false, // Default offline

    },

  },

  {

    timestamps: true, // createdAt, updatedAt auto add hoga

  }

);



const User = mongoose.models.User || mongoose.model("User", userSchema);



export default User;



// 💬 models/Message.js — Message ka MongoDB schema

// Har sent message ka data yahan store hoga



import mongoose from "mongoose";



const messageSchema = new mongoose.Schema(

  {

    // Kisne bheja — User ka _id

    sender: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "User", // User model se linked hai

      required: true,

    },



    // Sender ka naam — baar baar User fetch na karna pade isliye save karte hain

    senderName: {

      type: String,

      required: true,

    },



    // Message ka text content

    text: {

      type: String,

      required: true,

      trim: true,

    },



    // Yeh message kiske liye hai (receiver ka _id)

    // null = group/global message (sabko dikhega)

    receiver: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,

    },

  },

  {

    timestamps: true, // createdAt se pata chalega message kab bheja

  },

);



const Message =

  mongoose.models.Message || mongoose.model("Message", messageSchema);



export default Message;



// 📝 api/auth/register/route.js — Naya user register karna

// POST /api/auth/register

// Body: { name, email, password }



import { connectDB } from "@/lib/db";

import User from "@/models/user";

import { signToken } from "@/lib/jwt";

import bcrypt from "bcryptjs";

import { NextResponse } from "next/server";

import { cookies } from "next/headers";



export async function POST(req) {

  try {

    await connectDB();



    const { name, email, password } = await req.json();



    // Validation — saare fields zaroori hain

    if (!name || !email || !password) {

      return NextResponse.json(

        { error: "All fields are required" },

        { status: 400 },

      );

    }



    // Password kam se kam 6 characters hona chahiye

    if (password.length < 6) {

      return NextResponse.json(

        { error: "Password must be at least 6 characters" },

        { status: 400 },

      );

    }



    // Check karo email pehle se registered hai ya nahi

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return NextResponse.json(

        { error: "Email already registered" },

        { status: 400 },

      );

    }



    // 🔒 Password hash karo — plain text kabhi save mat karo

    // 10 = salt rounds (jitna zyada, utna secure lekin slow)

    const hashedPassword = await bcrypt.hash(password, 10);



    // Naya user create karo

    const user = await User.create({

      name,

      email,

      password: hashedPassword, // Hash save karo, plain text nahi

      isOnline: true,

    });



    // 🎫 JWT token banao — user ka ID aur naam token mein store hoga

    const token = signToken({

      userId: user._id,

      name: user.name,

      email: user.email,

    });



    // 🍪 Token ko HTTP-only cookie mein save karo

    // HTTP-only = JavaScript se access nahi hoga (XSS attacks se safe)

    const cookieStore = await cookies();

    cookieStore.set("token", token, {

      httpOnly: true, // JS se access nahi hoga

      secure: process.env.NODE_ENV === "production", // HTTPS only in production

      maxAge: 7 * 24 * 60 * 60, // 7 din (seconds mein)

      path: "/",

    });



    // Password send mat karo response mein

    return NextResponse.json({

      message: "Registered successfully",

      user: {

        _id: user._id,

        name: user.name,

        email: user.email,

      },

    });

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}



// 🔐 api/auth/login/route.js — User login karna

// POST /api/auth/login

// Body: { email, password }



import { connectDB } from "@/lib/db";

import User from "@/models/user";

import { signToken } from "@/lib/jwt";

import bcrypt from "bcryptjs";

import { NextResponse } from "next/server";

import { cookies } from "next/headers";



export async function POST(req) {

  try {

    await connectDB();



    const { email, password } = await req.json();



    // Validation

    if (!email || !password) {

      return NextResponse.json(

        { error: "Email and password are required" },

        { status: 400 },

      );

    }



    // Email se user dhundo

    const user = await User.findOne({ email });



    // User nahi mila — generic error do (security ke liye specific mat batao)

    if (!user) {

      return NextResponse.json(

        { error: "Invalid email or password" },

        { status: 401 },

      );

    }



    // 🔒 Password compare karo — bcrypt hash se compare karta hai

    // user.password = database mein hashed password

    // password = user ne abhi type kiya

    const isPasswordCorrect = await bcrypt.compare(password, user.password);



    if (!isPasswordCorrect) {

      return NextResponse.json(

        { error: "Invalid email or password" },

        { status: 401 },

      );

    }



    // User online mark karo

    await User.findByIdAndUpdate(user._id, { isOnline: true });



    // 🎫 JWT token banao

    const token = signToken({

      userId: user._id,

      name: user.name,

      email: user.email,

    });



    // 🍪 Cookie mein save karo

    const cookieStore = await cookies();

    cookieStore.set("token", token, {

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      maxAge: 7 * 24 * 60 * 60, // 7 din

      path: "/",

    });



    return NextResponse.json({

      message: "Login successful",

      user: {

        _id: user._id,

        name: user.name,

        email: user.email,

      },

    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}



// 🚪 api/auth/logout/route.js — User logout karna

// POST /api/auth/logout

// Cookie delete karo aur user offline mark karo



import { connectDB } from "@/lib/db";

import User from "@/models/user";

import { verifyToken } from "@/lib/jwt";

import { NextResponse } from "next/server";

import { cookies } from "next/headers";



export async function POST() {

  try {

    const cookieStore = await cookies();



    // Cookie se token lo

    const token = cookieStore.get("token")?.value;



    if (token) {

      // Token verify karo aur user ID nikalo

      const decoded = verifyToken(token);



      if (decoded?.userId) {

        // User offline mark karo database mein

        await connectDB();

        await User.findByIdAndUpdate(decoded.userId, { isOnline: false });

      }

    }



    // 🍪 Cookie delete karo — yahi logout hai

    cookieStore.delete("token");



    return NextResponse.json({ message: "Logged out successfully" });

  } catch (error) {

    console.log("LOGOUT ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}



// 💬 api/messages/route.js — Messages fetch aur send karna

// GET  /api/messages?receiverId=xxx — Messages fetch karo

// POST /api/messages — Naya message send karo



import { connectDB } from "@/lib/db";

import Message from "@/models/message";

import { verifyToken } from "@/lib/jwt";

import { NextResponse } from "next/server";

import { cookies } from "next/headers";



// 🔒 Helper — Cookie se logged-in user ka data lo

const getLoggedInUser = async () => {

  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return verifyToken(token); // { userId, name, email }

};



// 🟢 GET — Messages fetch karo

export async function GET(req) {

  try {

    const user = await getLoggedInUser();



    // Login check

    if (!user) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }



    await connectDB();



    // URL se receiverId lo: /api/messages?receiverId=abc123

    const { searchParams } = new URL(req.url);

    const receiverId = searchParams.get("receiverId");



    let messages;



    if (receiverId) {

      // Private chat: sirf in dono ke beech ke messages

      // Matlab: main ne use bheje + usne mujhe bheje

      messages = await Message.find({

        $or: [

          { sender: user.userId, receiver: receiverId },

          { sender: receiverId, receiver: user.userId },

        ],

      }).sort({ createdAt: 1 }); // Purane messages pehle

    } else {

      // Global chat: sabke messages (receiver = null)

      messages = await Message.find({ receiver: null })

        .sort({ createdAt: 1 })

        .limit(50); // Last 50 messages

    }



    return NextResponse.json(messages);

  } catch (error) {

    console.log("GET MESSAGES ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}



// 🟢 POST — Naya message bhejo

export async function POST(req) {

  try {

    const user = await getLoggedInUser();



    if (!user) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }



    await connectDB();



    const { text, receiverId } = await req.json();



    // Validation

    if (!text || !text.trim()) {

      return NextResponse.json(

        { error: "Message cannot be empty" },

        { status: 400 },

      );

    }



    // Message create karo

    const message = await Message.create({

      sender: user.userId,

      senderName: user.name,

      text: text.trim(),

      receiver: receiverId || null, // null = global message

    });



    return NextResponse.json(message, { status: 201 });

  } catch (error) {

    console.log("POST MESSAGE ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}



// 👥 api/users/route.js — Saare users ki list

// GET /api/users — Sidebar mein users dikhane ke liye



import { connectDB } from "@/lib/db";

import User from "@/models/user";

import { verifyToken } from "@/lib/jwt";

import { NextResponse } from "next/server";

import { cookies } from "next/headers";



export async function GET() {

  try {

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;



    // Login check

    if (!token) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }



    const decoded = verifyToken(token);

    if (!decoded) {

      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    }



    await connectDB();



    // Saare users lo EXCEPT currently logged-in user

    // "-password" = password field return mat karo (security)

    const users = await User.find({ _id: { $ne: decoded.userId } })

      .select("-password")

      .sort({ isOnline: -1, name: 1 }); // Online users pehle, phir alphabetically



    return NextResponse.json(users);

  } catch (error) {

    console.log("GET USERS ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}



// 🔒 middleware.js — Route protection

// Har request se pehle chalta hai

// Login nahi hai toh /login par redirect karo

// Login hai toh /login open nahi hoga — /chat par redirect



import { NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";



export function middleware(req) {

  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;



  // Token verify karo

  const user = token ? verifyToken(token) : null;



  // Yeh routes sirf login ke baad accessible hain

  const isProtected = pathname.startsWith("/chat") || pathname === "/";



  // Yeh routes sirf bina login ke accessible hain

  const isAuthRoute =

    pathname.startsWith("/login") || pathname.startsWith("/register");



  // Protected route par ja raha hai lekin login nahi

  if (isProtected && !user) {

    return NextResponse.redirect(new URL("/login", req.url));

  }



  // Auth route par ja raha hai lekin already login hai

  if (isAuthRoute && user) {

    return NextResponse.redirect(new URL("/chat", req.url));

  }



  return NextResponse.next();

}



export const config = {

  matcher: ["/", "/chat/:path*", "/login", "/register"],

};



"use client";



// 🔐 context/AuthContext.js — Logged-in user ka global state

// Poore app mein user ki info available rahegi bina props pass kiye



import { createContext, useContext, useState, useEffect } from "react";

import { useRouter } from "next/navigation";



const AuthContext = createContext();



export function AuthProvider({ children }) {

  // Logged-in user ka data store karega

  // null = logged out, object = logged in

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true); // Page load par check kar raha hai

  const router = useRouter();



  // App load hone par check karo — user already logged in hai ya nahi

  useEffect(() => {

    const stored = localStorage.getItem("chatUser");

    if (stored) {

      try {

        setUser(JSON.parse(stored)); // LocalStorage se user restore karo

      } catch {

        localStorage.removeItem("chatUser");

      }

    }

    setLoading(false);

  }, []);



  // ✅ Login — user data save karo

  const login = (userData) => {

    setUser(userData);

    // LocalStorage mein bhi save karo taaki page refresh par bana rahe

    localStorage.setItem("chatUser", JSON.stringify(userData));

  };



  // 🚪 Logout — user data clear karo

  const logout = async () => {

    try {

      // Backend API call — cookie delete hogi aur user offline hoga

      await fetch("/api/auth/logout", { method: "POST" });

    } catch (error) {

      console.log("Logout error:", error);

    }

    setUser(null);

    localStorage.removeItem("chatUser");

    router.push("/login");

  };



  return (

    <AuthContext.Provider value={{ user, login, logout, loading }}>

      {children}

    </AuthContext.Provider>

  );

}



// Custom hook — easily auth use karne ke liye

// Usage: const { user, login, logout } = useAuth();

export const useAuth = () => useContext(AuthContext);



MONGODB_URI=mongodb://akashkashyap0770_db_user:BQPznFLODmu7dgAk@ac-x6yfbvb-shard-00-00.hxpwf03.mongodb.net:27017,ac-x6yfbvb-shard-00-01.hxpwf03.mongodb.net:27017,ac-x6yfbvb-shard-00-02.hxpwf03.mongodb.net:27017/?ssl=true&replicaSet=atlas-3kerm0-shard-0&authSource=admin&appName=Cluster0

JWT_SECRET=koi_bhi_random_string_likho



yeh jo tumne code diya tha swiftChat nextjs project yeh kam nhi kr rha ise ache se analyze kro or isme db connection nhi ho rha or signup or login page pehle dikhna chaiye pr nhi dikh rha mene image share ki hai is thara ka interface dikha rha jb bhi project run krta hu pehle user signup krega uske bad chat krega ki pehle hi or message send krne pr unauthorized bta rha yeh sb problem hai baki tum ache se is sbhi code ko analyze kro or jo bhi bug ya issue hai use solve krke mujhe full code ke sth do









```
