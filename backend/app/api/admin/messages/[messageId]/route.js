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

export async function DELETE(request, { params }) {
  try {
    const adminCheck = verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: adminCheck.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { messageId } = await params;

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
