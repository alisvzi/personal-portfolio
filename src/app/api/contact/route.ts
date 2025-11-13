import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Message from "@/lib/models/Message";

// GET all messages
export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find({}).sort({ createdAt: -1 }).lean();
    const normalized = messages.map((m: any) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      subject: m.subject ?? "",
      message: m.message,
      read: !!m.read,
      createdAt: m.createdAt,
    }));
    return NextResponse.json(normalized, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching messages", error: error.message },
      { status: 500 }
    );
  }
}

// POST a new message
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const newMsg = await Message.create({ name, email, subject, message });
    return NextResponse.json({ id: newMsg._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error creating message", error: error.message },
      { status: 500 }
    );
  }
}