// Returns all users except the currently logged-in user
// Used by the sidebar to show who you can chat with

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode token to get current user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    // Get everyone except the logged-in user, sorted by name
    const users = await User.find(
      { _id: { $ne: decoded.userId } }, // $ne = "not equal"
      { password: 0 }, // don't return password
    ).sort({ name: 1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
