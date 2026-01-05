import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import User from "@/src/models/User";
import Message from "@/src/models/Message";

const verifyAdmin = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isAdmin: false, message: "No token provided" };
  }

  try {
    const token = authHeader.substring(7);
    const jwt = require("jsonwebtoken");
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

    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });

    return NextResponse.json({
      totalUsers,
      totalMessages,
      unreadMessages,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
