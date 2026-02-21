import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import CustomerMessage from "@/src/models/CustomerMessage";
import { verifyAuth } from "@/src/utils/authUtils";

// GET - Fetch chat messages between user and specific customer
export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const { customerId } = params;

    // Fetch all chat messages between this user and customer
    const messages = await CustomerMessage.find({
      userId: authResult.user.userId,
      customerId: customerId,
      type: "chat",
    }).sort({ createdAt: 1 }); // Oldest first for chat

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

// POST - Send a chat message from user to customer
export async function POST(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const { customerId } = params;
    const { message } = await request.json();

    const Customer = (await import("@/src/models/Customer")).default;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    // Create new chat message
    const newMessage = new CustomerMessage({
      customerId: customer._id,
      customerName: customer.name,
      userId: authResult.user.userId,
      userEmail: authResult.user.email,
      message,
      type: "chat",
      senderType: "user",
      senderId: authResult.user.userId,
    });

    await newMessage.save();

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: newMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

// PATCH - Mark messages as read
export async function PATCH(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const { customerId } = params;

    // Mark all unread messages from this customer as read
    await CustomerMessage.updateMany(
      {
        userId: authResult.user.userId,
        customerId: customerId,
        senderType: "customer",
        isRead: false,
      },
      { isRead: true },
    );

    return NextResponse.json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
