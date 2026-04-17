"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Don't create multiple sockets
    if (socket) return;

    console.log("🔌 Connecting to socket...");

    const newSocket = io({
      path: "/api/socket.io", // Must match server path
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected successfully:", newSocket.id);
      newSocket.emit("join", user._id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      console.log("🔄 Attempting to reconnect...");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Reconnect if server disconnected
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      newSocket.emit("join", user._id);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn("useSocket must be used within a SocketProvider");
  }
  return context;
}
