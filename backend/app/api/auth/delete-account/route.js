import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";
import User from "@/src/models/User";
import Customer from "@/src/models/Customer";
import Supplier from "@/src/models/Supplier";
import Transaction from "@/src/models/Transaction";
import SupplierTransaction from "@/src/models/SupplierTransaction";
import Cashbook from "@/src/models/Cashbook";

export async function DELETE(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete all related data
    await Customer.deleteMany({ userId: decoded.userId });
    await Supplier.deleteMany({ userId: decoded.userId });
    await Transaction.deleteMany({ userId: decoded.userId });
    await SupplierTransaction.deleteMany({ userId: decoded.userId });
    await Cashbook.deleteMany({ userId: decoded.userId });

    // Delete the user
    await User.findByIdAndDelete(decoded.userId);

    return NextResponse.json({
      message: "Account and all associated data deleted successfully",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    console.error("Delete account error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
