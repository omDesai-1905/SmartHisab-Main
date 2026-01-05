import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import { verifyCustomerAuth } from "@/src/utils/customerAuthUtils";

export async function GET(request) {
  try {
    const authResult = await verifyCustomerAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const customerId = authResult.customer.customerId;
    const customer = await Customer.findById(customerId).select("-password");

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
