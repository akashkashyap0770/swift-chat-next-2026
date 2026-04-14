"use client";

// SocketContext.js
//
// A socket is like a phone call between your browser and the server.
// Once connected, the server can "call you" (push data) at any time —
// without you having to ask first.
//
// We create ONE socket connection for the whole app here.
// Any component can call useSocket() to use it.
//
// WHY ONE SOCKET FOR THE WHOLE APP?
//   If ChatWindow created its own socket, and Navbar created another,
//   you'd have two connections. One socket is enough for everything.

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null); // null until connected
  const { user } = useAuth(); // we need to know WHO is logged in

  useEffect(() => {
    // Don't connect if nobody is logged in
    if (!user) return;

    // Open the socket connection to our own server (same URL as the app)
    const newSocket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"], // try fast websocket first, fall back to polling
      reconnection: true, // if connection drops, try to reconnect automatically
      reconnectionAttempts: 5, // give up after 5 failed attempts
      reconnectionDelay: 1000, // wait 1 second between each attempt
    });

    // When connection succeeds, tell the server which user we are.
    // The server then puts us in a "room" named after our userId.
    // This is how private messages are delivered only to us.
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("join", user._id); // tell server: "I am user X"
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket could not connect:", error.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(newSocket); // save socket so components can use it

    // Cleanup: when user logs out or component unmounts, close the connection
    return () => {
      newSocket.disconnect();
    };
  }, [user]); // re-run this if user changes (e.g. login/logout)

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

// Any component calls useSocket() to get the socket.
// Example:
//   const socket = useSocket();
//   socket.on("new-message", (msg) => console.log(msg));
export function useSocket() {
  return useContext(SocketContext);
}
