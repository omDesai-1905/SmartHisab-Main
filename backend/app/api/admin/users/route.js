import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";
import User from "@/src/models/User";

const verifyAdmin = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isAdmin: false, message: "No token provided" };
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return { isAdmin: false, message: "Not authorized" };
    }

    return { isAdmin: true };
  } catch (error) {
    return { isAdmin: false, message: "Invalid token" };
  }
};

export async function GET(request) {
  try {
    const adminCheck = verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: adminCheck.message },
        { status: 401 }
      );
    }

    await connectDB();

    const users = await User.find(
      {},
      {
        password: 0, // Exclude password field
      }
    ).sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
