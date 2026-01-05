import { NextResponse } from "next/server";
import connectDB from "@/src/connection/mongoConnection";
import Message from "@/src/models/Message";
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

    const messages = await Message.find({
      userId: authResult.user.userId,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
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

    const { emailAddress, topic, description } = await request.json();

    const message = new Message({
      userId: authResult.user.userId,
      emailAddress,
      topic,
      description,
    });

    await message.save();

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
