import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
import { verifyAuth } from "@/src/utils/authUtils";
import {
  generateCustomerId,
  generatePassword,
} from "@/src/utils/customerUtils";

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const customers = await Customer.find({ userId: authResult.user.userId });

    const customersWithBalance = await Promise.all(
      customers.map(async (customer) => {
        const transactions = await Transaction.find({
          customerId: customer._id,
        });

        let balance = 0;
        transactions.forEach((transaction) => {
          if (transaction.type === "credit") {
            balance += transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        });

        return {
          ...customer.toObject(),
          balance,
        };
      })
    );

    return NextResponse.json(customersWithBalance);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { name, phone } = await request.json();

    const customerId = generateCustomerId(name);
    const password = await generatePassword(name, phone);

    const customer = new Customer({
      name,
      phone,
      customerId,
      password,
      userId: authResult.user.userId,
      userEmail: authResult.user.email,
    });

    await customer.save();

    return NextResponse.json(
      {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        customerId: customer.customerId,
        temporaryPassword: password,
        userId: customer.userId,
        userEmail: customer.userEmail,
        createdAt: customer.createdAt,
        message:
          "Customer created successfully. Please note the Customer ID and Password for customer portal access.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
