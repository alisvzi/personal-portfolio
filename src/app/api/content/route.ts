import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const content = await ContentModel.findOne();

    if (!content) {
      return NextResponse.json(
        { message: "No content found" },
        { status: 404 }
      );
    }

    return NextResponse.json(content, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching content", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();

    const existing = await ContentModel.findOne();

    let updatedContent;

    if (existing) {
      updatedContent = await ContentModel.findByIdAndUpdate(
        existing._id,
        data,
        { new: true }
      );
    } else {
      updatedContent = await ContentModel.create(data);
    }

    return NextResponse.json(updatedContent, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error saving content", error: error.message },
      { status: 500 }
    );
  }
}
