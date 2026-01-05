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

    const { id } = await params;
    const { name, phone } = await request.json();

    const customer = await Customer.findOneAndUpdate(
      { _id: id, userId: authResult.user.userId },
      { name, phone },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
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

    const { id } = await params;

    const customer = await Customer.findOneAndDelete({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete all transactions for this customer
    await Transaction.deleteMany({ customerId: id });

    return NextResponse.json({
      message: "Customer and related transactions deleted",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
