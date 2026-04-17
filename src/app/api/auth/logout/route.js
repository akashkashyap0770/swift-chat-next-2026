export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { verifyToken } from "@/lib/jwt";

export async function POST() {
  try {
    // ✅ FIX: cookies() must be awaited in Next.js 15 — missing await caused silent crash in production
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      const decoded = verifyToken(token);

      if (decoded?.userId) {
        await connectDB();
        await User.findByIdAndUpdate(decoded.userId, { isOnline: false });
      }
    }

    // ✅ FIX: use the already-awaited cookieStore, not a fresh cookies() call
    cookieStore.delete("token");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
