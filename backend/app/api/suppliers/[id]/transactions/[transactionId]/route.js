import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Supplier from "@/src/models/Supplier";
import SupplierTransaction from "@/src/models/SupplierTransaction";
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

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    const updateData = { type, amount, description };
    if (date) {
      updateData.date = new Date(date);
    }

    const transaction = await SupplierTransaction.findOneAndUpdate(
      { _id: transactionId, supplierId: id, userId: authResult.user.userId },
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

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    const transaction = await SupplierTransaction.findOneAndDelete({
      _id: transactionId,
      supplierId: id,
      userId: authResult.user.userId,
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
