import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/connection/mongoConnection";
import User from "@/src/models/User";
import Customer from "@/src/models/Customer";
import Transaction from "@/src/models/Transaction";
import Cashbook from "@/src/models/Cashbook";

const verifyAdmin = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isAdmin: false, message: "No token provided" };
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return { isAdmin: false, message: "Not authorized" };
    }

    return { isAdmin: true };
  } catch (error) {
    return { isAdmin: false, message: "Invalid token" };
  }
};

export async function GET(request, { params }) {
  try {
    const adminCheck = verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: adminCheck.message },
        { status: 401 }
      );
    }

    await connectDB();

    const { userId } = await params;

    // Get user info
    const user = await User.findById(userId, { password: 0 });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get customer count
    const totalCustomers = await Customer.countDocuments({ userId });

    // Get transaction statistics
    const transactions = await Transaction.find({ userId });

    let totalDebit = 0;
    let totalCredit = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        totalDebit += transaction.amount;
      } else if (transaction.type === "credit") {
        totalCredit += transaction.amount;
      }
    });

    const netAmount = totalCredit - totalDebit;

    // Get cashbook statistics
    const cashbookEntries = await Cashbook.find({ userId });

    let totalIncome = 0;
    let totalExpense = 0;

    cashbookEntries.forEach((entry) => {
      if (entry.type === "income") {
        totalIncome += entry.amount;
      } else if (entry.type === "expense") {
        totalExpense += entry.amount;
      }
    });

    const netIncomeExpense = totalIncome - totalExpense;

    return NextResponse.json({
      user,
      statistics: {
        totalCustomers,
        totalDebit,
        totalCredit,
        netAmount,
        totalIncome,
        totalExpense,
        netIncomeExpense,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
