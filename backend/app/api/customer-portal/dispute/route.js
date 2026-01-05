import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
import CustomerMessage from "@/src/models/CustomerMessage";
import { verifyCustomerAuth } from "@/src/utils/customerAuthUtils";

export async function POST(request) {
  try {
    const authResult = await verifyCustomerAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { transactionId, subject, message } = await request.json();
    const customerId = authResult.customer.customerId;

    const customer = await Customer.findById(customerId);
    const transaction = await Transaction.findById(transactionId);

    if (
      !transaction ||
      transaction.customerId.toString() !== customerId.toString()
    ) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    const disputeMessage = new CustomerMessage({
      customerId: customer._id,
      customerName: customer.name,
      userId: customer.userId,
      userEmail: customer.userEmail,
      transactionId,
      subject,
      message,
      type: "dispute",
    });

    await disputeMessage.save();

    return NextResponse.json(
      {
        message: "Dispute message sent successfully to the user",
        disputeMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending dispute:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
