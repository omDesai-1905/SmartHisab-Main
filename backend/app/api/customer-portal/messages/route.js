import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import CustomerMessage from "@/src/models/CustomerMessage";
import { verifyCustomerAuth } from "@/src/utils/customerAuthUtils";

export async function GET(request) {
  try {
    const authResult = await verifyCustomerAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const customerId = authResult.customer.customerId;

    // Fetch all messages for this customer (chat conversation)
    const messages = await CustomerMessage.find({
      customerId,
      type: "chat",
    }).sort({
      createdAt: 1, // Oldest first for chat display
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyCustomerAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const { subject, message, type } = await request.json();
    const customerId = authResult.customer.customerId;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    const newMessage = new CustomerMessage({
      customerId: customer._id,
      customerName: customer.name,
      userId: customer.userId,
      userEmail: customer.userEmail,
      subject,
      message,
      type: type || "chat",
      senderType: "customer",
      senderId: customer._id,
    });

    await newMessage.save();

    return NextResponse.json(
      {
        message: "Message sent successfully to the business owner",
        data: newMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
