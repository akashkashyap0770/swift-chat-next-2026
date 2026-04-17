"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function SideBar({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        const res = await fetch("/api/users", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          console.log("Unauthorized - redirecting to login");
          // window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // Rest of your component remains the same
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
          Chats
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Global Chat */}
        <div
          onClick={() => onSelectUser(null)}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800 transition ${
            selectedUser === null
              ? "bg-gray-800 border-r-2 border-blue-500"
              : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            🌐
          </div>
          <div>
            <p className="text-white text-sm font-medium">Global Chat</p>
            <p className="text-gray-500 text-xs">Everyone</p>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            Direct Messages
          </p>
        </div>

        {loading ? (
          <p className="px-4 py-3 text-gray-500 text-sm">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-3 text-gray-500 text-sm">No other users yet</p>
        ) : (
          users.map((userItem) => (
            <div
              key={userItem._id}
              onClick={() => onSelectUser(userItem)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800 transition ${
                selectedUser?._id === userItem._id
                  ? "bg-gray-800 border-r-2 border-blue-500"
                  : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                  {userItem.name?.charAt(0).toUpperCase()}
                </div>
                {userItem.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {userItem.name}
                </p>
                <p
                  className={`text-xs ${userItem.isOnline ? "text-green-400" : "text-gray-500"}`}
                >
                  {userItem.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
