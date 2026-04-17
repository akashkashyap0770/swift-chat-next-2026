import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public pages (no login required)
  const isPublicPage = pathname === "/login" || pathname === "/register";

  // Protected pages (login required)
  const isProtectedPage = pathname === "/" || pathname.startsWith("/chat");

  // API routes protection
  const isApiRoute = pathname.startsWith("/api/");

  const user = token ? verifyToken(token) : null;

  // Redirect logic
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPage && user) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/login", "/register"],
};
