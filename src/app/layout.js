"use client";

import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-950 text-white`}>
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
