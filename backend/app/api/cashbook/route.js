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

    const entries = await Cashbook.find({
      userId: authResult.user.userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching cashbook entries:", error);
    return NextResponse.json(
      { error: "Server error while fetching entries" },
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

    const { type, amount, description, date } = await request.json();

    const newEntry = new Cashbook({
      userId: authResult.user.userId,
      userEmail: authResult.user.email,
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      date: new Date(date),
    });

    const savedEntry = await newEntry.save();
    return NextResponse.json(savedEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating cashbook entry:", error);
    return NextResponse.json(
      { error: "Server error while creating entry" },
      { status: 500 }
    );
  }
}
