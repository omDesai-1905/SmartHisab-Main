import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import CustomerMessage from "@/src/models/CustomerMessage";
import { verifyCustomerAuth } from "@/src/utils/customerAuthUtils";

export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyCustomerAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { messageId } = await params;
    const customerId = authResult.customer.customerId;

    const message = await CustomerMessage.findOneAndDelete({
      _id: messageId,
      customerId: customerId,
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found or unauthorized" },
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
