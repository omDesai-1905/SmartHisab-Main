import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import CustomerMessage from "@/src/models/CustomerMessage";
import { verifyAuth } from "@/src/utils/authUtils";

export async function PATCH(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { messageId } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["pending", "in-progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find the message and verify it belongs to this user
    const message = await CustomerMessage.findOne({
      _id: messageId,
      userId: authResult.user.userId,
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the status
    message.status = status;
    await message.save();

    return NextResponse.json({
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
