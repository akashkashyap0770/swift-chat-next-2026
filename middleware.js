import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths (no auth needed)
  const isPublicPath = pathname === "/login" || pathname === "/register";

  // Auth API paths (don't require token)
  const isAuthApi =
    pathname === "/api/auth/login" || pathname === "/api/auth/register";

  // Socket.io path (always allow)
  const isSocketPath = pathname.includes("/socket.io");

  // Protected API paths
  const isProtectedApi =
    pathname.startsWith("/api/") && !isAuthApi && !isSocketPath;

  // Protected pages
  const isProtectedPage = pathname === "/" || pathname.startsWith("/chat");

  const user = token ? verifyToken(token) : null;

  // Allow socket connections always
  if (isSocketPath) {
    return NextResponse.next();
  }

  // Page redirects
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && user) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // API auth
  if (isProtectedApi && !user) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/login", "/register", "/api/:path*"],
};
