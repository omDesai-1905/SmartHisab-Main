import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";

export async function GET(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { valid: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return NextResponse.json(
        { valid: false, message: "Not authorized as admin" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      admin: {
        email: decoded.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
