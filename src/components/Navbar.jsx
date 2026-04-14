"use client";

// Top navigation bar
// Shows app name on the left, user email + logout button on the right

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* App logo and name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">💬</span>
          </div>
          <span className="text-white font-semibold text-lg">SwiftChat</span>
        </div>

        {/* Right side: show user info + logout if logged in */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar circle with first letter of email */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Show user name */}
            <span className="text-gray-300 text-sm hidden md:inline">
              {user.name}
            </span>

            {/* Logout button */}
            <button
              onClick={logout}
              className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
