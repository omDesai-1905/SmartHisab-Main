import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";
import User from "@/src/models/User";

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

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { valid: false, message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
