"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        console.log("🔍 Checking authentication...");
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Important: include cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Auth response status:", response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log("✅ User authenticated:", userData.name);
          setUser(userData);
        } else {
          console.log("❌ Not authenticated, status:", response.status);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkIfLoggedIn();
  }, []);

  function login(userData) {
    console.log("🔐 Logging in user:", userData.name);
    setUser(userData);
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
