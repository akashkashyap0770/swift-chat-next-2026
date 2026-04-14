import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Hash the password before saving (never store plain text!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await User.create({
      name,
      username: name, // using name as username for simplicity
      email,
      password: hashedPassword,
      isOnline: true,
    });

    // Create a JWT token for this user
    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    // Save token in a secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true, // JS can't access this (protects against XSS)
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return NextResponse.json({
      message: "Registered successfully",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
