import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { verifyToken } from "@/lib/jwt";

export async function POST() {
  try {
    const token = cookies().get("token")?.value;

    if (token) {
      const decoded = verifyToken(token);

      if (decoded?.userId) {
        await connectDB();
        await User.findByIdAndUpdate(decoded.userId, {
          isOnline: false,
        });
      }
    }

    cookies().delete("token");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
