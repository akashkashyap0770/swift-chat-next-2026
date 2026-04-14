"use client";

// AuthContext.js
//
// Think of this like a "global variable" for the logged-in user.
// Any component in the app can ask: "who is logged in right now?"
// without needing to pass the user down as a prop through every component.
//
// HOW IT WORKS:
//   1. We create a "context" (like an empty box).
//   2. AuthProvider wraps the whole app and puts user data IN that box.
//   3. Any component calls useAuth() to READ from that box.

import { createContext, useContext, useEffect, useState } from "react";

// Step 1: Create an empty box (context). null = nothing in it yet.
const AuthContext = createContext(null);

// Step 2: AuthProvider wraps the whole app (see layout.js).
// It holds the logged-in user in state, and shares it with everyone below.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null means "not logged in"
  const [loading, setLoading] = useState(true); // true while we're checking the cookie

  // When the app first loads, ask the server "am I already logged in?"
  // The server checks the cookie and returns the user if valid.
  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        const response = await fetch("/api/auth/me"); // server reads the cookie
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // save user — they were already logged in
        }
        // If response is not ok, user is not logged in — user stays null
      } catch (error) {
        console.error("Could not check login status:", error);
      } finally {
        setLoading(false); // done checking, either way
      }
    }

    checkIfLoggedIn();
  }, []); // empty [] = only runs once when the app first loads

  // Call this after a successful login or registration
  function login(userData) {
    setUser(userData);
  }

  // Call this when the user clicks "Logout"
  async function logout() {
    try {
      // Tell the server to clear the cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null); // clear user from memory
  }

  // Step 2 (continued): share user, loading, login, logout with ALL child components
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Any component calls useAuth() to get the user info.
// Example usage in a component:
//   const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
