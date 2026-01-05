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

    const { id } = await params;
    const { name, phone } = await request.json();

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, userId: authResult.user.userId },
      { name, phone },
      { new: true }
    );

    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
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

    const supplier = await Supplier.findOneAndDelete({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    // Delete all transactions for this supplier
    await SupplierTransaction.deleteMany({ supplierId: id });

    return NextResponse.json({
      message: "Supplier and related transactions deleted",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
