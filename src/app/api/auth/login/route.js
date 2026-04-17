import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Update online status
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    // Create response with cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
    });

    // Set cookie on the response
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true, // Always true for HTTPS (Render uses HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
