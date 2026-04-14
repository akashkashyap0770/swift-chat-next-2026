// Middleware runs on every request BEFORE it hits your API or pages
// It checks if the user is logged in and redirects accordingly

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Pages that don't require login
  const isPublicPage = pathname === "/login" || pathname === "/register";

  // Pages that require login
  const isProtectedPage = pathname === "/" || pathname.startsWith("/chat");

  // Decode token to check if valid
  const user = token ? verifyToken(token) : null;

  // Not logged in + trying to access a protected page → redirect to login
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in + trying to visit login/register → redirect to chat
  if (isPublicPage && user) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next(); // allow the request through
}

export const config = {
  // Apply middleware to these routes only
  matcher: [
    "/",
    "/chat/:path*",
    "/login",
    "/register",
    "/api/messages/:path*",
    "/api/users/:path*",
  ],
};
