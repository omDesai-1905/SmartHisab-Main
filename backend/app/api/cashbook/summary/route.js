import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Cashbook from "@/src/models/Cashbook";
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

    const entries = await Cashbook.find({ userId: authResult.user.userId });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      totalEntries: entries.length,
      incomeEntries: 0,
      expenseEntries: 0,
    };

    entries.forEach((entry) => {
      if (entry.type === "income") {
        summary.totalIncome += entry.amount;
        summary.incomeEntries++;
      } else if (entry.type === "expense") {
        summary.totalExpense += entry.amount;
        summary.expenseEntries++;
      }
    });

    summary.netBalance = summary.totalIncome - summary.totalExpense;

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching cashbook summary:", error);
    return NextResponse.json(
      { error: "Server error while fetching summary" },
      { status: 500 }
    );
  }
}
