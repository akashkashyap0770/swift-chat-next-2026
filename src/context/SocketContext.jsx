"use client";

// SocketContext.js
// Socket = browser aur server ke beech ek open line
// Jab server kuch bhejta hai, browser turant receive karta hai

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Login nahi hua to socket mat banao
    if (!user) return;

    const newSocket = io(window.location.origin, {
      path: "/socket.io",

      // ✅ FIX: polling pehle, websocket baad mein
      // Render pe direct websocket fail hota hai
      // polling se connect hoke phir websocket pe upgrade karta hai
      transports: ["polling", "websocket"],

      upgrade: true, // polling se websocket pe upgrade karne ki koshish karo
      reconnection: true,
      reconnectionAttempts: 10, // zyada attempts
      reconnectionDelay: 2000, // 2 second wait between attempts
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("join", user._id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket error:", error.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
