import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import User from "@/models/user";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    await connectDB();

    const users = await User.find(
      { _id: { $ne: decoded.userId } },
      { password: 0 },
    ).sort({ name: 1 });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
