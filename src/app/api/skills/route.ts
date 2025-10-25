import { connectDB } from "@/lib/db/mongodb";
import { handleApiError } from "@/lib/errors";
import Skill from "@/lib/models/Skill";
import { NextRequest, NextResponse } from "next/server";

// GET all skills
export async function GET() {
  try {
    await connectDB();

    const skills = await Skill.find({}).sort({ name: 1 }).lean();

    return NextResponse.json({
      skills,
    });
  } catch (error: any) {
    console.error("Get skills error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: errorResponse.error,
        details: errorResponse.details,
      },
      { status: errorResponse.statusCode }
    );
  }
}

// POST a new skill
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, category, level } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }

    const newSkill = await Skill.create({
      name,
      category,
      level,
    });

    return NextResponse.json(
      { message: "Skill created successfully", skill: newSkill },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create skill error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: errorResponse.error,
        details: errorResponse.details,
      },
      { status: errorResponse.statusCode }
    );
  }
}

// PUT (update) a skill
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const updatedSkill = await Skill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Skill updated successfully", skill: updatedSkill },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update skill error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: errorResponse.error,
        details: errorResponse.details,
      },
      { status: errorResponse.statusCode }
    );
  }
}

// DELETE a skill
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const deletedSkill = await Skill.findByIdAndDelete(id);

    if (!deletedSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Skill deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete skill error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: errorResponse.error,
        details: errorResponse.details,
      },
      { status: errorResponse.statusCode }
    );
  }
}
