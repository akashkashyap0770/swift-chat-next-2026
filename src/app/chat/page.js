export const dynamic = "force-dynamic";

"use client";

// Main chat page
// Shows: Navbar on top, Sidebar on left, ChatWindow on right

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";
import ChatWindow from "@/components/ChatWindow";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ChatPage() {
  // selectedUser = the person you're chatting with (null = Global Chat)
  const [selectedUser, setSelectedUser] = useState(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // prevents flash before redirect

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Top navigation bar */}
      <Navbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: list of users */}
        <SideBar selectedUser={selectedUser} onSelectUser={setSelectedUser} />

        {/* Right: messages area */}
        <ChatWindow selectedUser={selectedUser} />
      </div>
    </div>
  );
}