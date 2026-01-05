import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";

export async function POST(request) {
  try {
    await connectDB();

    const { customerId, password } = await request.json();

    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (customer.password !== password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { customerId: customer._id, customerId_username: customer.customerId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        customerId: customer.customerId,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
