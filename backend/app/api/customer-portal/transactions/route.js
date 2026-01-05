import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
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

    const transactions = await Transaction.find({ customerId }).sort({
      date: -1,
    });

    let balance = 0;
    const transactionsWithBalance = transactions.map((transaction) => {
      if (transaction.type === "credit") {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      return {
        ...transaction.toObject(),
        runningBalance: balance,
      };
    });

    transactionsWithBalance.reverse();

    return NextResponse.json({
      transactions: transactionsWithBalance,
      totalBalance: balance,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
