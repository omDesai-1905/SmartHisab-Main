import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Check if it's admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "Invalid admin credentials" },
        { status: 400 }
      );
    }

    // Generate admin token
    const token = jwt.sign(
      { isAdmin: true, email: ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      token,
      admin: {
        email: ADMIN_EMAIL,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
