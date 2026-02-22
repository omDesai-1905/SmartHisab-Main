import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import CustomerMessage from "@/src/models/CustomerMessage";
import { verifyAuth } from "@/src/utils/authUtils";

// POST - Delete multiple messages (only by user)
export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const { messageIds } = await request.json();

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { message: "No message IDs provided" },
        { status: 400 },
      );
    }

    // Find messages to verify they belong to this user
    const messages = await CustomerMessage.find({
      _id: { $in: messageIds },
    });

    // Check if all messages belong to this user's conversations
    const unauthorized = messages.some(
      (msg) => msg.userId.toString() !== authResult.user.userId,
    );

    if (unauthorized) {
      return NextResponse.json(
        { message: "Unauthorized to delete one or more messages" },
        { status: 403 },
      );
    }

    // Delete all messages
    const result = await CustomerMessage.deleteMany({
      _id: { $in: messageIds },
      userId: authResult.user.userId,
    });

    return NextResponse.json({
      message: `${result.deletedCount} message(s) deleted successfully`,
      deletedCount: result.deletedCount,
      messageIds: messageIds,
    });
  } catch (error) {
    console.error("Error deleting messages:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
