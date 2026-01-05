import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import CustomerMessage from "@/src/models/CustomerMessage";
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

    const messages = await CustomerMessage.find({
      userId: authResult.user.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching customer messages:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
