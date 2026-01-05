import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Supplier from "@/src/models/Supplier";
import SupplierTransaction from "@/src/models/SupplierTransaction";
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

    const transactions = await SupplierTransaction.find({
      supplierId: id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ supplier, transactions });
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

    const transaction = new SupplierTransaction({
      supplierId: id,
      supplierName: supplier.name,
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
