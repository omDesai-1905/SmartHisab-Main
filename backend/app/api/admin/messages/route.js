import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";
import Message from "@/src/models/Message";

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

    const messages = await Message.find({})
      .populate("userId", "name email mobileNumber businessName")
      .sort({ createdAt: -1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
