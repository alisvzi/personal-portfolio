import { connectDB } from "@/lib/db/mongodb";
import { handleApiError } from "@/lib/errors";
import project from "@/lib/models/Project";
import { generateThumbHash } from "@/lib/utils/image/thumbhash";
import { saveImageFile, deleteImageFile } from "@/lib/utils/image/upload";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const projects = await project.find({}).sort({ _id: -1 }).lean();
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Get projects error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: errorResponse.details || error.message,
      },
      { status: errorResponse.statusCode || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const projectUrl = formData.get("projectUrl") as string;
    const technologies = formData.get("technologies") as string;
    const featured = formData.get("featured") === "true";
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Image is required." },
        { status: 400 },
      );
    }

    const { filePath, publicUrl } = await saveImageFile(file, "projects");
    const thumbhash = await generateThumbHash(filePath);

    const newProject = await project.create({
      title,
      description,
      githubUrl,
      projectUrl,
      technologies,
      featured,
      imageUrl: publicUrl,
      imagePlaceholderUrl: thumbhash,
    });

    return NextResponse.json(
      { message: "Project created successfully", project: newProject },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create project error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: "Failed to create project",
        details: errorResponse.details || error.message,
      },
      { status: errorResponse.statusCode || 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const projectUrl = formData.get("projectUrl") as string;
    const technologies = formData.get("technologies") as string;
    const featured = formData.get("featured") === "true";
    const file = formData.get("image") as File | null;

    const existingProject = await project.findById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    let imageUrl = existingProject.imageUrl;
    let imagePlaceholderUrl = existingProject.imagePlaceholderUrl;

    if (file) {
      await deleteImageFile(existingProject.imageUrl);
      const { filePath, publicUrl } = await saveImageFile(file, "projects");
      imageUrl = publicUrl;
      imagePlaceholderUrl = await generateThumbHash(filePath);
    }

    existingProject.title = title;
    existingProject.description = description;
    existingProject.githubUrl = githubUrl;
    existingProject.projectUrl = projectUrl;
    existingProject.technologies = technologies;
    existingProject.featured = featured;
    existingProject.imageUrl = imageUrl;
    existingProject.imagePlaceholderUrl = imagePlaceholderUrl;

    await existingProject.save();

    return NextResponse.json(
      { message: "Project updated successfully", project: existingProject },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update project error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: "Failed to update project",
        details: errorResponse.details || error.message,
      },
      { status: errorResponse.statusCode || 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 },
      );
    }

    const existingProject = await project.findById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    await deleteImageFile(existingProject.imageUrl);
    await existingProject.deleteOne();

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete project error:", error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: "Failed to delete project",
        details: errorResponse.details || error.message,
      },
      { status: errorResponse.statusCode || 500 },
    );
  }
}
