import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public paths (no auth needed)
  const isPublicPath = pathname === "/login" || pathname === "/register";

  // Protected pages
  const isProtectedPage = pathname === "/" || pathname.startsWith("/chat");

  // API paths - let API routes handle auth
  const isApiPath = pathname.startsWith("/api/");

  // Let API routes handle their own auth
  if (isApiPath) {
    return NextResponse.next();
  }

  // Check for token cookie (just presence, not verification)
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;

  // Page redirects
  if (isProtectedPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/login", "/register"],
};
