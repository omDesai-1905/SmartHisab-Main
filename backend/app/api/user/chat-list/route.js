import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import CustomerMessage from "@/src/models/CustomerMessage";
import Customer from "@/src/models/Customer";
import { verifyAuth } from "@/src/utils/authUtils";

// GET - Fetch all customers with their last message (chat list)
export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    // Get all customers for this user
    const customers = await Customer.find({
      userId: authResult.user.userId,
    }).select("_id name phone");

    // Get the last message and unread count for each customer
    const chatList = await Promise.all(
      customers.map(async (customer) => {
        const lastMessage = await CustomerMessage.findOne({
          customerId: customer._id,
          userId: authResult.user.userId,
          type: "chat",
        }).sort({ createdAt: -1 });

        const unreadCount = await CustomerMessage.countDocuments({
          customerId: customer._id,
          userId: authResult.user.userId,
          type: "chat",
          senderType: "customer",
          isRead: false,
        });

        return {
          customerId: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          lastMessage: lastMessage
            ? {
                message: lastMessage.message,
                timestamp: lastMessage.createdAt,
                senderType: lastMessage.senderType,
                isRead: lastMessage.isRead,
              }
            : null,
          unreadCount,
        };
      }),
    );

    // Sort by last message timestamp (most recent first)
    chatList.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
      );
    });

    return NextResponse.json({ chatList });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
