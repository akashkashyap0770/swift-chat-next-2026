import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths (no authentication needed)
  const isPublicPath = pathname === "/login" || pathname === "/register";

  // Auth API paths (don't require token for login/register)
  const isAuthApi =
    pathname === "/api/auth/login" || pathname === "/api/auth/register";

  // Protected API paths (require token)
  const isProtectedApi = pathname.startsWith("/api/") && !isAuthApi;

  // Protected pages
  const isProtectedPage = pathname === "/" || pathname.startsWith("/chat");

  // Check if user is authenticated
  const user = token ? verifyToken(token) : null;

  // Redirect logic for pages
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && user) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // API authentication
  if (isProtectedApi && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/login", "/register", "/api/:path*"],
};
