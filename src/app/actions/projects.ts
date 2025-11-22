"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db/mongodb";
import ProjectModel from "@/lib/models/Project";
import { createPlaceholderImage } from "@/lib/utils/image/placeholder";
import { generateThumbHash } from "@/lib/utils/image/thumbhash";
import { saveImageFile } from "@/lib/utils/image/upload";

// Project type definition
type Project = {
  id?: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  imageUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string;
  featured: boolean;
  order: number;
};

// Create a new project
export async function createProject(formData: FormData) {
  // Validate required fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("imageUrl") as File | null;

  if (!title || !description || !file) {
    return {
      success: false,
      error: "Title, description and image URL are required",
    };
  }

  let imageUrl: string;
  let thumbhash: string | null;

  if (file) {
    const { filePath, publicUrl } = await saveImageFile(file, "projects");
    imageUrl = publicUrl;
    thumbhash = await generateThumbHash(filePath);
  } else {
    const { filePath, publicUrl } = await createPlaceholderImage({
      text: title || "Project",
    });
    imageUrl = publicUrl;
    thumbhash = await generateThumbHash(filePath);
  }

  try {
    await connectDB();

    const project = {
      title,
      titleFa: formData.get("titleFa") as string,
      description,
      descriptionFa: formData.get("descriptionFa") as string,
      imageUrl,
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      technologies: formData.get("technologies") as string,
      featured: formData.get("featured") === "on", // Checkbox value is "on" when checked
      order: parseInt(formData.get("order") as string) || 0,
      imagePlaceholderUrl: thumbhash!,
    };

    await ProjectModel.create(project);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Update an existing project
export async function updateProject(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: "Project ID is required" };
  }

  // Validate required fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!title || !description || !imageUrl) {
    return {
      success: false,
      error: "Title, description and image URL are required",
    };
  }

  try {
    await connectDB();

    const projectData = {
      title,
      titleFa: formData.get("titleFa") as string,
      description,
      descriptionFa: formData.get("descriptionFa") as string,
      imageUrl,
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      technologies: formData.get("technologies") as string,
      featured: formData.get("featured") === "on", // Checkbox value is "on" when checked
      order: parseInt(formData.get("order") as string) || 0,
    };

    await ProjectModel.findByIdAndUpdate(id, projectData, { new: true });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Delete a project
export async function deleteProject(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Project ID is required" };
  }

  try {
    await connectDB();
    await ProjectModel.findByIdAndDelete(id);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Get all projects
export async function getProjects() {
  try {
    await connectDB();
    const projects = await ProjectModel.find({}).sort({ order: 1 }).lean();

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}
