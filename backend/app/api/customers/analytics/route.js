import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
import { verifyAuth } from "@/src/utils/authUtils";

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

    // Get all customers for this user
    const customers = await Customer.find({ userId: authResult.user.userId });
    const totalCustomers = customers.length;

    // Get all transactions for this user
    const transactions = await Transaction.find({
      userId: authResult.user.userId,
    });

    // Calculate total debit and credit amounts
    let totalDebitAmount = 0;
    let totalCreditAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        totalDebitAmount += transaction.amount;
      } else if (transaction.type === "credit") {
        totalCreditAmount += transaction.amount;
      }
    });

    // Calculate net balance (credit - debit)
    const netBalance = totalCreditAmount - totalDebitAmount;

    return NextResponse.json({
      totalCustomers,
      totalDebitAmount,
      totalCreditAmount,
      netBalance,
      transactions: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
