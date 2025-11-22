import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    let content = await ContentModel.findOne();

    if (!content) {
      content = await ContentModel.create({
        heroTitle: "Hi, my name is Ali",
        heroSubtitle: "Frontend Developer",
        heroDescription:
          "Building clean, responsive web experiences with React and Next.js.",
        aboutText: "About me text",
        contactEmail: "ali.soveizi@example.com",
        contactPhone: "+98 912 345 6789",
      });
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
