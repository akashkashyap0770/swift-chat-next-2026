// app/layout.js
// Only change here: wrap everything with SocketProvider
// so every component in the app can access the socket

import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext"; // ← NEW
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "SwiftChat — Real-time Messaging",
  description: "A simple real-time chat app built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-950 text-white`}>
        {/*
          Order matters:
          AuthProvider first → so SocketProvider can read the logged-in user
          SocketProvider second → connects socket after user is known
        */}
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-center" />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
