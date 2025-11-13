import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Message from "@/lib/models/Message";

// PATCH: update a message (e.g., mark as read)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;
    const body = await req.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json({ message: "Message ID is required" }, { status: 400 });
    }

    const updated = await Message.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error updating message", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: remove a message
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Message ID is required" }, { status: 400 });
    }

    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error deleting message", error: error.message },
      { status: 500 }
    );
  }
}