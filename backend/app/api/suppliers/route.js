import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Supplier from "@/src/models/Supplier";
import SupplierTransaction from "@/src/models/SupplierTransaction";
import { verifyAuth } from "@/src/utils/authUtils";

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const suppliers = await Supplier.find({ userId: authResult.user.userId });

    const suppliersWithBalance = await Promise.all(
      suppliers.map(async (supplier) => {
        const transactions = await SupplierTransaction.find({
          supplierId: supplier._id,
        });

        let totalDebit = 0;
        let totalCredit = 0;
        transactions.forEach((transaction) => {
          if (transaction.type === "debit") {
            totalDebit += transaction.amount;
          } else {
            totalCredit += transaction.amount;
          }
        });

        const balance = totalDebit - totalCredit;

        return {
          ...supplier.toObject(),
          balance,
          totalDebit,
          totalCredit,
        };
      }),
    );

    return NextResponse.json(suppliersWithBalance);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 },
      );
    }

    await connectDB();

    const { name, phone } = await request.json();

    const supplier = new Supplier({
      name,
      phone,
      userId: authResult.user.userId,
      userEmail: authResult.user.email,
    });

    await supplier.save();

    return NextResponse.json(
      {
        _id: supplier._id,
        name: supplier.name,
        phone: supplier.phone,
        userId: supplier.userId,
        userEmail: supplier.userEmail,
        createdAt: supplier.createdAt,
        balance: 0,
        message: "Supplier created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
