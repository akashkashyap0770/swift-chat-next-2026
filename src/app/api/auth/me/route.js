// This route checks if the user is currently logged in
// Called on app startup to restore login state

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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    // Fetch fresh user data from DB (without password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}
