import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { verifyToken } from "@/lib/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // If user has a valid token, mark them as offline
    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.userId) {
        await connectDB();
        await User.findByIdAndUpdate(decoded.userId, { isOnline: false });
      }
    }

    // Delete the auth cookie
    cookieStore.delete("token");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
