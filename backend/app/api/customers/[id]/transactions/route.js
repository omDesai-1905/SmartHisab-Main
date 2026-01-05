import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
import { verifyAuth } from "@/src/utils/authUtils";

export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

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

    const transactions = await Transaction.find({ customerId: id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ customer, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
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

    const transaction = new Transaction({
      customerId: id,
      customerName: customer.name,
      userId: authResult.user.userId,
      userEmail: authResult.user.email,
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
    });

    await transaction.save();
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
