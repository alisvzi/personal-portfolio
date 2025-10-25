import { connectDB } from "@/lib/db/mongodb";
import ExperienceModel from "@/lib/models/Experience";
import { Experience } from "@/types";
import { NextRequest, NextResponse } from "next/server";

function validateExperience(data: any) {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string")
    errors.push("Title is required and must be a string");
  if (!data.company || typeof data.company !== "string")
    errors.push("Company is required and must be a string");
  if (!data.period || typeof data.period !== "string")
    errors.push("Period is required and must be a string");
  if (!data.description || typeof data.description !== "string")
    errors.push("Description is required and must be a string");
  if (!Array.isArray(data.technologies) || data.technologies.length === 0)
    errors.push("Technologies must be a non-empty array of strings");
  if (
    data.technologies &&
    !data.technologies.every((t: any) => typeof t === "string")
  )
    errors.push("All technologies must be strings");

  return errors;
}

export async function GET() {
  try {
    await connectDB();
    const experiences = await ExperienceModel.find({})
      .sort({ period: -1 })
      .lean();
    return NextResponse.json({ experiences }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching experiences", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data: Experience = await req.json();

    const errors = validateExperience(data);
    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const newExperience = await ExperienceModel.create(data);
    return NextResponse.json(
      { message: "Experience created", experience: newExperience },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error creating experience", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const data: Experience & { id?: string } = await req.json();

    if (!data.id)
      return NextResponse.json(
        { message: "Experience ID is required" },
        { status: 400 }
      );

    const errors = validateExperience(data);
    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const updated = await ExperienceModel.findByIdAndUpdate(data.id, data, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return NextResponse.json(
        { message: "Experience not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { message: "Experience updated", experience: updated },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error updating experience", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { message: "Experience ID is required" },
        { status: 400 }
      );

    const deleted = await ExperienceModel.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json(
        { message: "Experience not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { message: "Experience deleted" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error deleting experience", error: error.message },
      { status: 500 }
    );
  }
}
