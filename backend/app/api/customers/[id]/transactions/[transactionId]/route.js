import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
import { verifyAuth } from "@/src/utils/authUtils";

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { id, transactionId } = await params;
    const { type, amount, description, date } = await request.json();

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const updateData = { type, amount, description };
    if (date) {
      updateData.date = new Date(date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, customerId: id, userId: authResult.user.userId },
      updateData,
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { id, transactionId } = await params;

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      customerId: id,
      userId: authResult.user.userId,
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
