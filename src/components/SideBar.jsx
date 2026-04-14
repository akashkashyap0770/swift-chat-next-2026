"use client";

// SideBar.jsx
// Shows all registered users in the left panel
// FIX: Removed the setInterval — users list only fetches ONCE on load
// No more repeated /api/users calls every 10 seconds

import { useEffect, useState } from "react";

export default function SideBar({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users ONCE when the sidebar first loads
  // No interval — user list doesn't need to refresh constantly
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (error) {
        // silently ignore — sidebar still renders
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(); // runs only once — no setInterval
  }, []); // empty [] = only runs when component first mounts

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
          Chats
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Global Chat option */}
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

        {/* Section label */}
        <div className="px-4 py-2">
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            Direct Messages
          </p>
        </div>

        {/* User list */}
        {loading ? (
          <p className="px-4 py-3 text-gray-500 text-sm">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-3 text-gray-500 text-sm">No other users yet</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800 transition ${
                selectedUser?._id === user._id
                  ? "bg-gray-800 border-r-2 border-blue-500"
                  : ""
              }`}
            >
              {/* Avatar with online dot */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                )}
              </div>

              {/* Name and status */}
              <div>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p
                  className={`text-xs ${user.isOnline ? "text-green-400" : "text-gray-500"}`}
                >
                  {user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
