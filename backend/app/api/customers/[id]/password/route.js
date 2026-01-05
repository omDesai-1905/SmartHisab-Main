import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
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

    const { id } = await params;

    // Find customer and verify it belongs to this user
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

    return NextResponse.json({
      customerId: customer.customerId,
      password: customer.password,
    });
  } catch (error) {
    console.error("Error fetching customer password:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
