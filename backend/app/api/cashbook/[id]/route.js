import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Cashbook from "@/src/models/Cashbook";
import { verifyAuth } from "@/src/utils/authUtils";

export async function PUT(request, { params }) {
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
    const { type, amount, description, date } = await request.json();

    const entry = await Cashbook.findOne({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    entry.type = type;
    entry.amount = parseFloat(amount);
    entry.description = description.trim();
    entry.date = new Date(date);
    entry.userEmail = authResult.user.email;

    const updatedEntry = await entry.save();
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating cashbook entry:", error);
    return NextResponse.json(
      { error: "Server error while updating entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const entry = await Cashbook.findOne({
      _id: id,
      userId: authResult.user.userId,
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await Cashbook.findByIdAndDelete(id);
    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting cashbook entry:", error);
    return NextResponse.json(
      { error: "Server error while deleting entry" },
      { status: 500 }
    );
  }
}
